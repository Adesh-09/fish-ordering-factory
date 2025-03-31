
import * as React from "react"

// Set the breakpoint for mobile devices
const MOBILE_BREAKPOINT = 768

/**
 * Hook to detect if the current device is mobile
 * 
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to check if the device is mobile
    const checkIsMobile = () => {
      const mobileCheck = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobileCheck)
    }
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)
    
    // Initial check
    checkIsMobile()
    
    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return !!isMobile
}

/**
 * Hook to check if the device has touch capabilities
 * 
 * @returns {boolean} True if the device has touch capabilities, false otherwise
 */
export function useHasTouch() {
  const [hasTouch, setHasTouch] = React.useState<boolean>(false)
  
  React.useEffect(() => {
    const touchCheck = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      (navigator.msMaxTouchPoints !== undefined && navigator.msMaxTouchPoints > 0)
    
    setHasTouch(touchCheck)
  }, [])
  
  return hasTouch
}

/**
 * Hook to get the current orientation of the device
 * 
 * @returns {string} "portrait" or "landscape"
 */
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  
  React.useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.innerHeight > window.innerWidth
      setOrientation(isPortrait ? "portrait" : "landscape")
    }
    
    window.addEventListener("resize", handleOrientationChange)
    handleOrientationChange()
    
    return () => window.removeEventListener("resize", handleOrientationChange)
  }, [])
  
  return orientation
}
