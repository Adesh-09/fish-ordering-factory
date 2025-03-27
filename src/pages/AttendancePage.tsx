
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Users, UserPlus, CalendarX } from "lucide-react";
import PasswordModal from "@/components/PasswordModal";

interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  joinDate: Date;
}

interface AttendanceRecord {
  employeeId: string;
  date: Date;
  status: "present" | "absent" | "half-day" | "leave";
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

// Sample employee data
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Rajesh Sharma",
    role: "Head Chef",
    phone: "9876543210",
    joinDate: new Date(2021, 5, 15)
  },
  {
    id: "2",
    name: "Amit Patel",
    role: "Assistant Chef",
    phone: "9876543211",
    joinDate: new Date(2022, 2, 10)
  },
  {
    id: "3",
    name: "Priya Singh",
    role: "Waiter",
    phone: "9876543212",
    joinDate: new Date(2022, 7, 20)
  },
  {
    id: "4",
    name: "Sunil Kumar",
    role: "Waiter",
    phone: "9876543213",
    joinDate: new Date(2023, 1, 5)
  },
  {
    id: "5",
    name: "Neha Gupta",
    role: "Cashier",
    phone: "9876543214",
    joinDate: new Date(2022, 4, 12)
  }
];

// Generate random attendance for demo purposes
const generateInitialAttendance = (): AttendanceRecord[] => {
  const today = new Date();
  const records: AttendanceRecord[] = [];
  
  const dateRange = eachDayOfInterval({
    start: startOfMonth(today),
    end: today
  });
  
  initialEmployees.forEach(employee => {
    dateRange.forEach(date => {
      // Random status with 70% chance of present
      const random = Math.random();
      let status: AttendanceRecord["status"] = "present";
      
      if (random > 0.7 && random <= 0.85) {
        status = "absent";
      } else if (random > 0.85 && random <= 0.95) {
        status = "half-day";
      } else if (random > 0.95) {
        status = "leave";
      }
      
      records.push({
        employeeId: employee.id,
        date: new Date(date),
        status,
        checkInTime: status === "present" || status === "half-day" ? "09:00" : undefined,
        checkOutTime: status === "present" ? "18:00" : status === "half-day" ? "13:00" : undefined,
      });
    });
  });
  
  return records;
};

const AttendancePage = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(generateInitialAttendance());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    role: "",
    phone: "",
  });
  
  const navigate = useNavigate();
  
  // Filter employees by search query
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get days in selected month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  });
  
  // Get attendance for a specific day
  const getAttendanceForDay = (employeeId: string, date: Date) => {
    return attendance.find(record => 
      record.employeeId === employeeId && 
      isSameDay(new Date(record.date), date)
    );
  };
  
  // Get attendance summary for an employee
  const getAttendanceSummary = (employeeId: string) => {
    const employeeAttendance = attendance.filter(record => 
      record.employeeId === employeeId &&
      new Date(record.date).getMonth() === selectedMonth.getMonth() &&
      new Date(record.date).getFullYear() === selectedMonth.getFullYear()
    );
    
    const present = employeeAttendance.filter(record => record.status === "present").length;
    const absent = employeeAttendance.filter(record => record.status === "absent").length;
    const halfDay = employeeAttendance.filter(record => record.status === "half-day").length;
    const leave = employeeAttendance.filter(record => record.status === "leave").length;
    
    return { present, absent, halfDay, leave };
  };
  
  // Add new employee
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) {
      toast({
        title: "Invalid Entry",
        description: "Please provide a name and role for the employee.",
        variant: "destructive"
      });
      return;
    }
    
    const newEmployeeRecord: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      role: newEmployee.role,
      phone: newEmployee.phone || "",
      joinDate: new Date()
    };
    
    setEmployees([...employees, newEmployeeRecord]);
    setNewEmployee({ name: "", role: "", phone: "" });
    
    toast({
      title: "Employee Added",
      description: `${newEmployee.name} has been added to the system.`,
    });
  };
  
  // Update attendance status
  const updateAttendanceStatus = (employeeId: string, date: Date, status: AttendanceRecord["status"]) => {
    const existingRecordIndex = attendance.findIndex(record => 
      record.employeeId === employeeId && 
      isSameDay(new Date(record.date), date)
    );
    
    if (existingRecordIndex >= 0) {
      // Update existing record
      const updatedAttendance = [...attendance];
      updatedAttendance[existingRecordIndex] = {
        ...updatedAttendance[existingRecordIndex],
        status,
        checkInTime: status === "present" || status === "half-day" ? "09:00" : undefined,
        checkOutTime: status === "present" ? "18:00" : status === "half-day" ? "13:00" : undefined,
      };
      setAttendance(updatedAttendance);
    } else {
      // Create new record
      const newRecord: AttendanceRecord = {
        employeeId,
        date,
        status,
        checkInTime: status === "present" || status === "half-day" ? "09:00" : undefined,
        checkOutTime: status === "present" ? "18:00" : status === "half-day" ? "13:00" : undefined,
      };
      setAttendance([...attendance, newRecord]);
    }
    
    toast({
      title: "Attendance Updated",
      description: `Attendance status has been updated to ${status}.`,
    });
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return format(date, "d");
  };
  
  // Get status color
  const getStatusColor = (status?: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "half-day":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "leave":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  if (showPasswordModal) {
    return (
      <PasswordModal
        onSuccess={() => setShowPasswordModal(false)}
        onCancel={() => navigate(-1)}
        title="Attendance System Access"
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Attendance</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track and manage employee attendance
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input 
                          placeholder="Employee name"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Role</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          value={newEmployee.role}
                          onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                        >
                          <option value="">Select Role</option>
                          <option value="Head Chef">Head Chef</option>
                          <option value="Assistant Chef">Assistant Chef</option>
                          <option value="Waiter">Waiter</option>
                          <option value="Cashier">Cashier</option>
                          <option value="Manager">Manager</option>
                          <option value="Cleaner">Cleaner</option>
                        </select>
                      </div>
                      
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input 
                          type="tel"
                          placeholder="Phone number"
                          value={newEmployee.phone}
                          onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Button className="w-full" onClick={handleAddEmployee}>
                          Add Employee
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Monthly Attendance Sheet
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(selectedMonth, "MMMM yyyy")}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  const prevMonth = new Date(selectedMonth);
                  prevMonth.setMonth(prevMonth.getMonth() - 1);
                  setSelectedMonth(prevMonth);
                }}
              >
                Previous Month
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setSelectedMonth(new Date())}
                disabled={
                  selectedMonth.getMonth() === new Date().getMonth() &&
                  selectedMonth.getFullYear() === new Date().getFullYear()
                }
              >
                Current Month
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  const nextMonth = new Date(selectedMonth);
                  nextMonth.setMonth(nextMonth.getMonth() + 1);
                  
                  // Don't allow future months beyond current
                  const today = new Date();
                  if (
                    nextMonth.getMonth() > today.getMonth() &&
                    nextMonth.getFullYear() >= today.getFullYear()
                  ) {
                    return;
                  }
                  
                  setSelectedMonth(nextMonth);
                }}
                disabled={
                  selectedMonth.getMonth() >= new Date().getMonth() &&
                  selectedMonth.getFullYear() >= new Date().getFullYear()
                }
              >
                Next Month
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-100 dark:bg-gray-700 sticky left-0 z-10">Employee</TableHead>
                  {daysInMonth.map((day) => (
                    <TableHead 
                      key={day.toString()}
                      className={`text-center min-w-[40px] px-1 ${
                        isToday(day) 
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" 
                          : ""
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span>{formatDateForDisplay(day)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(day, "E").charAt(0)}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="bg-gray-100 dark:bg-gray-700 min-w-[120px]">Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={daysInMonth.length + 2} className="text-center py-8">
                      No employees found. Add some employees to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => {
                    const summary = getAttendanceSummary(employee.id);
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-800 z-10">
                          <div>
                            <div className="font-semibold">{employee.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.role}</div>
                          </div>
                        </TableCell>
                        
                        {daysInMonth.map((day) => {
                          const record = getAttendanceForDay(employee.id, day);
                          
                          return (
                            <TableCell 
                              key={day.toString()} 
                              className={`text-center p-1 ${isToday(day) ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                            >
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center ${
                                      record ? getStatusColor(record.status) : "bg-gray-100 dark:bg-gray-700"
                                    }`}
                                    onClick={() => setSelectedDate(day)}
                                  >
                                    {record?.status === "present" ? "P" :
                                     record?.status === "absent" ? "A" :
                                     record?.status === "half-day" ? "H" :
                                     record?.status === "leave" ? "L" : "-"}
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Update Attendance</DialogTitle>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <p className="mb-4">
                                      <strong>Employee:</strong> {employee.name}<br />
                                      <strong>Date:</strong> {format(selectedDate, "dd MMMM yyyy")}
                                    </p>
                                    
                                    <div className="space-y-2">
                                      <Button
                                        variant={record?.status === "present" ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => updateAttendanceStatus(employee.id, selectedDate, "present")}
                                      >
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-2 text-xs font-bold">P</span>
                                        Present
                                      </Button>
                                      
                                      <Button
                                        variant={record?.status === "absent" ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => updateAttendanceStatus(employee.id, selectedDate, "absent")}
                                      >
                                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center mr-2 text-xs font-bold">A</span>
                                        Absent
                                      </Button>
                                      
                                      <Button
                                        variant={record?.status === "half-day" ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => updateAttendanceStatus(employee.id, selectedDate, "half-day")}
                                      >
                                        <span className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center mr-2 text-xs font-bold">H</span>
                                        Half Day
                                      </Button>
                                      
                                      <Button
                                        variant={record?.status === "leave" ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => updateAttendanceStatus(employee.id, selectedDate, "leave")}
                                      >
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center mr-2 text-xs font-bold">L</span>
                                        Leave
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          );
                        })}
                        
                        <TableCell className="bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex flex-col text-xs">
                            <span className="text-green-600 dark:text-green-400">Present: {summary.present}</span>
                            <span className="text-red-600 dark:text-red-400">Absent: {summary.absent}</span>
                            <span className="text-yellow-600 dark:text-yellow-400">Half-Day: {summary.halfDay}</span>
                            <span className="text-blue-600 dark:text-blue-400">Leave: {summary.leave}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;
