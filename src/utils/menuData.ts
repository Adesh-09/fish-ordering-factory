
export interface MenuItem {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameEn: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "bigwan-special",
    name: "बिगवान स्पे. मच्छी थाळी",
    nameEn: "Bigwan Special Machhi Thali",
    items: [
      {
        id: "jayesh-special-machhi",
        name: "जयेश स्पे. मच्छी थाळी",
        nameEn: "Jayesh Special Machhi Thali",
        price: 250,
        category: "bigwan-special",
        description: "Our signature fish thali with special Jayesh preparation"
      },
      {
        id: "kadak-machhi",
        name: "कडक मच्छी थाळी",
        nameEn: "Kadak Machhi Thali",
        price: 200,
        category: "bigwan-special",
        description: "Crispy fish thali with traditional spices"
      },
      {
        id: "masala-machhi",
        name: "मसाला मच्छी थाळी",
        nameEn: "Masala Machhi Thali",
        price: 200,
        category: "bigwan-special",
        description: "Fish thali with rich masala gravy"
      },
      {
        id: "aalni-machhi",
        name: "आलणी मच्छी थाळी",
        nameEn: "Aalni Machhi Thali",
        price: 200,
        category: "bigwan-special",
        description: "Traditional Aalni style fish thali"
      }
    ]
  },
  {
    id: "bigwan-special-fry",
    name: "बिगवान स्पे. मच्छी फ्राय",
    nameEn: "Bigwan Special Machhi Fry",
    items: [
      {
        id: "kande-machhi-fry",
        name: "कांदे मच्छी फ्राय",
        nameEn: "Kande Machhi Fry",
        price: 130,
        category: "bigwan-special-fry",
        description: "Fried fish with onions"
      },
      {
        id: "masala-machhi-fry",
        name: "मसाला मच्छी फ्राय",
        nameEn: "Masala Machhi Fry",
        price: 130,
        category: "bigwan-special-fry",
        description: "Spicy masala fried fish"
      },
      {
        id: "aakani-machhi-fry",
        name: "आकणी मच्छी फ्राय",
        nameEn: "Aakani Machhi Fry",
        price: 130,
        category: "bigwan-special-fry",
        description: "Special Aakani style fried fish"
      },
      {
        id: "machhi-tikka-wati",
        name: "मच्छी टिक्का वाटी",
        nameEn: "Machhi Tikka Wati",
        price: 40,
        category: "bigwan-special-fry",
        description: "Fish tikka in a bowl"
      }
    ]
  },
  {
    id: "chicken-special",
    name: "चिकन स्पेशल",
    nameEn: "Chicken Special",
    items: [
      {
        id: "chicken-thali",
        name: "चिकन थाळी",
        nameEn: "Chicken Thali",
        price: 220,
        category: "chicken-special",
        description: "Complete chicken thali meal"
      },
      {
        id: "chicken-fry",
        name: "चिकन फ्राय",
        nameEn: "Chicken Fry",
        price: 130,
        category: "chicken-special",
        description: "Crispy fried chicken"
      },
      {
        id: "chicken-handi-full",
        name: "चिकन हांडी (फूल)",
        nameEn: "Chicken Handi Full",
        price: 470,
        category: "chicken-special",
        description: "Full portion of chicken handi"
      },
      {
        id: "chicken-handi-half",
        name: "चिकन हांडी (हाफ)",
        nameEn: "Chicken Handi Half",
        price: 270,
        category: "chicken-special",
        description: "Half portion of chicken handi"
      },
      {
        id: "chicken-tikka-wati",
        name: "चिकन टिक्का वाटी",
        nameEn: "Chicken Tikka Wati",
        price: 50,
        category: "chicken-special",
        description: "Chicken tikka in a bowl"
      },
      {
        id: "chicken-curry",
        name: "चिकन करी",
        nameEn: "Chicken Curry",
        price: 150,
        category: "chicken-special",
        description: "Traditional chicken curry"
      },
      {
        id: "aakani-chicken",
        name: "आकणी चिकन",
        nameEn: "Aakani Chicken",
        price: 150,
        category: "chicken-special",
        description: "Aakani style chicken preparation"
      }
    ]
  },
  {
    id: "raita",
    name: "रायते",
    nameEn: "Raita",
    items: [
      {
        id: "sada-raita",
        name: "साधा रायता",
        nameEn: "Sada Raita",
        price: 30,
        category: "raita",
        description: "Plain yogurt raita"
      },
      {
        id: "jira-raita-half",
        name: "जिरा रायता हाफ",
        nameEn: "Jira Raita Half",
        price: 50,
        category: "raita",
        description: "Half portion of cumin raita"
      },
      {
        id: "jira-raita-full",
        name: "जिरा रायता फूल",
        nameEn: "Jira Raita Full",
        price: 100,
        category: "raita",
        description: "Full portion of cumin raita"
      }
    ]
  },
  {
    id: "soltki",
    name: "सॉल्टकी",
    nameEn: "Soltki",
    items: [
      {
        id: "soltki",
        name: "सॉल्टकी",
        nameEn: "Soltki",
        price: 25,
        category: "soltki",
        description: "Traditional soltki"
      },
      {
        id: "thumsup",
        name: "थम्सअप",
        nameEn: "ThumsUp",
        price: 25,
        category: "soltki",
        description: "ThumsUp soft drink"
      },
      {
        id: "sprite",
        name: "स्प्राईट",
        nameEn: "Sprite",
        price: 25,
        category: "soltki",
        description: "Sprite soft drink"
      }
    ]
  },
  {
    id: "bread",
    name: "रोटी",
    nameEn: "Roti",
    items: [
      {
        id: "chapati",
        name: "चपाती",
        nameEn: "Chapati",
        price: 15,
        category: "bread",
        description: "Traditional chapati"
      },
      {
        id: "bajri-bhakri",
        name: "बाजरी भाकरी",
        nameEn: "Bajri Bhakri",
        price: 20,
        category: "bread",
        description: "Pearl millet flatbread"
      },
      {
        id: "jwari-bhakri",
        name: "ज्वारी भाकरी",
        nameEn: "Jwari Bhakri",
        price: 15,
        category: "bread",
        description: "Sorghum flatbread"
      }
    ]
  },
  {
    id: "surmai-special",
    name: "सुरमई स्पेशल मच्छी थाळी",
    nameEn: "Surmai Special Machhi Thali",
    items: [
      {
        id: "jayesh-special-surmai",
        name: "जयेश स्पे. सुरमई थाळी",
        nameEn: "Jayesh Special Surmai Thali",
        price: 400,
        category: "surmai-special",
        description: "Signature Surmai fish thali"
      },
      {
        id: "surmai-kande-thali",
        name: "सुरमई कांदे थाळी",
        nameEn: "Surmai Kande Thali",
        price: 380,
        category: "surmai-special",
        description: "Surmai fish with onion thali"
      },
      {
        id: "surmai-masala-thali",
        name: "सुरमई मसाला थाळी",
        nameEn: "Surmai Masala Thali",
        price: 380,
        category: "surmai-special",
        description: "Surmai fish with masala thali"
      },
      {
        id: "surmai-aakani-thali",
        name: "सुरमई आकणी थाळी",
        nameEn: "Surmai Aakani Thali",
        price: 380,
        category: "surmai-special",
        description: "Surmai fish in Aakani style thali"
      },
      {
        id: "bangda-kande-thali",
        name: "बांगडा कांदे थाळी",
        nameEn: "Bangda Kande Thali",
        price: 250,
        category: "surmai-special",
        description: "Mackerel with onion thali"
      }
    ]
  },
  {
    id: "paplet-special",
    name: "सुरमई पापलेट स्पेशल मच्छी थाळी",
    nameEn: "Surmai Paplet Special Machhi Thali",
    items: [
      {
        id: "paplet-kande-thali",
        name: "पापलेट कांदे थाळी",
        nameEn: "Paplet Kande Thali",
        price: 450,
        category: "paplet-special",
        description: "Pomfret with onion thali"
      },
      {
        id: "paplet-masala-thali",
        name: "पापलेट मसाला थाळी",
        nameEn: "Paplet Masala Thali",
        price: 450,
        category: "paplet-special",
        description: "Pomfret with masala thali"
      },
      {
        id: "paplet-aakani-thali",
        name: "पापलेट आकणी थाळी",
        nameEn: "Paplet Aakani Thali",
        price: 450,
        category: "paplet-special",
        description: "Pomfret in Aakani style thali"
      }
    ]
  },
  {
    id: "surmai-fry",
    name: "सुरमई स्पेशल मच्छी फ्राय",
    nameEn: "Surmai Special Machhi Fry",
    items: [
      {
        id: "paplet-kande-fry",
        name: "पापलेट कांदे फ्राय",
        nameEn: "Paplet Kande Fry",
        price: 320,
        category: "surmai-fry",
        description: "Pomfret fried with onions"
      },
      {
        id: "paplet-masala-fry",
        name: "पापलेट मसाला फ्राय",
        nameEn: "Paplet Masala Fry",
        price: 320,
        category: "surmai-fry",
        description: "Pomfret fried with masala"
      },
      {
        id: "paplet-aakani-fry",
        name: "पापलेट आकणी फ्राय",
        nameEn: "Paplet Aakani Fry",
        price: 320,
        category: "surmai-fry",
        description: "Pomfret fried in Aakani style"
      },
      {
        id: "kande-surmai-fry",
        name: "कांदे सुरमई मच्छी फ्राय",
        nameEn: "Kande Surmai Machhi Fry",
        price: 320,
        category: "surmai-fry",
        description: "Surmai fish fried with onions"
      },
      {
        id: "masala-surmai-fry",
        name: "मसाला सुरमई मच्छी फ्राय",
        nameEn: "Masala Surmai Machhi Fry",
        price: 320,
        category: "surmai-fry",
        description: "Surmai fish fried with masala"
      },
      {
        id: "aakani-surmai-fry",
        name: "आकणी सुरमई मच्छी फ्राय",
        nameEn: "Aakani Surmai Machhi Fry",
        price: 320,
        category: "surmai-fry",
        description: "Surmai fish fried in Aakani style"
      },
      {
        id: "bangda-kande-fry",
        name: "बांगडा कांदे मच्छी फ्राय",
        nameEn: "Bangda Kande Machhi Fry",
        price: 150,
        category: "surmai-fry",
        description: "Mackerel fried with onions"
      }
    ]
  },
  {
    id: "soups",
    name: "सूप",
    nameEn: "Soups",
    items: [
      {
        id: "machhi-rassa-wati",
        name: "मच्छी रस्सा वाटी",
        nameEn: "Machhi Rassa Wati",
        price: 50,
        category: "soups",
        description: "Fish soup bowl"
      },
      {
        id: "aakani-machhi-soup",
        name: "आकणी मच्छी सूप वाटी",
        nameEn: "Aakani Machhi Soup Wati",
        price: 50,
        category: "soups",
        description: "Aakani style fish soup bowl"
      }
    ]
  },
  {
    id: "anda-special",
    name: "अंडा स्पेशल",
    nameEn: "Anda Special",
    items: [
      {
        id: "anda-thali",
        name: "अंडा थाळी",
        nameEn: "Anda Thali",
        price: 150,
        category: "anda-special",
        description: "Egg thali meal"
      },
      {
        id: "anda-curry",
        name: "अंडा करी",
        nameEn: "Anda Curry",
        price: 80,
        category: "anda-special",
        description: "Egg curry"
      },
      {
        id: "anda-boiled",
        name: "अंडा बोईल",
        nameEn: "Anda Boiled",
        price: 15,
        category: "anda-special",
        description: "Boiled egg"
      }
    ]
  },
  {
    id: "kolambi-special",
    name: "सुरमई कोळंबी स्पेशल थाळी",
    nameEn: "Surmai Kolambi Special Thali",
    items: [
      {
        id: "kolambi-thali",
        name: "कोळंबी (प्रॉन्स) थाळी",
        nameEn: "Kolambi Prawns Thali",
        price: 450,
        category: "kolambi-special",
        description: "Prawn thali meal"
      },
      {
        id: "kolambi-fry",
        name: "कोळंबी (प्रॉन्स) फ्राय",
        nameEn: "Kolambi Prawns Fry",
        price: 320,
        category: "kolambi-special",
        description: "Fried prawns"
      },
      {
        id: "kolambi-curry",
        name: "कोळंबी (प्रॉन्स) करी",
        nameEn: "Kolambi Prawns Curry",
        price: 320,
        category: "kolambi-special",
        description: "Prawn curry"
      }
    ]
  }
];

// Helper function to get all menu items in a flat array
export const getAllMenuItems = (): MenuItem[] => {
  return menuCategories.flatMap(category => category.items);
};

// Helper function to get a menu item by ID
export const getMenuItemById = (id: string): MenuItem | undefined => {
  return getAllMenuItems().find(item => item.id === id);
};

// Helper function to get a category by ID
export const getCategoryById = (id: string): MenuCategory | undefined => {
  return menuCategories.find(category => category.id === id);
};
