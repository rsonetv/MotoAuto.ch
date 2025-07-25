export const VEHICLE_CATEGORIES = {
  SAMOCHODY: {
    Premium: ["Audi", "BMW", "Mercedes-Benz", "Porsche", "Jaguar", "Land Rover", "Lexus", "Tesla"],
    Główne: [
      "Volkswagen",
      "Ford",
      "Toyota",
      "Honda",
      "Hyundai",
      "Kia",
      "Mazda",
      "Nissan",
      "Opel",
      "Peugeot",
      "Renault",
      "Citroën",
      "Fiat",
      "Škoda",
    ],
    Specjalistyczne: ["Jeep", "Mini", "Smart", "Dacia", "Lancia", "Chrysler", "Dodge"],
  },
  MOTOCYKLE: {
    Japońskie: ["Honda", "Yamaha", "Suzuki", "Kawasaki"],
    Europejskie: ["BMW", "Ducati", "KTM", "Triumph", "Aprilia", "Moto Guzzi", "Husqvarna"],
    Amerykańskie: ["Harley-Davidson", "Indian", "Victory", "Buell"],
    Inne: ["Benelli", "CFMoto", "Zontes", "Junak", "Romet", "Barton", "Sym", "Kymco", "Piaggio"],
  },
  DOSTAWCZE: {
    Lekkie: ["Mercedes-Benz", "Volkswagen", "Ford", "Iveco", "Renault", "Peugeot", "Citroën", "Fiat"],
    Średnie: ["Mercedes-Benz", "Volkswagen", "Ford", "Iveco", "MAN", "DAF", "Volvo"],
    Ciężkie: ["Mercedes-Benz", "Scania", "Volvo", "MAN", "DAF", "Iveco", "Renault Trucks"],
  },
}

// Comprehensive vehicle models database
export const VEHICLE_MODELS = {
  // PREMIUM CAR BRANDS
  Audi: [
    "A1",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
    "Q2",
    "Q3",
    "Q4 e-tron",
    "Q5",
    "Q7",
    "Q8",
    "TT",
    "R8",
    "e-tron GT",
    "RS3",
    "RS4",
    "RS5",
    "RS6",
    "RS7",
    "RSQ3",
    "RSQ8",
  ],
  BMW: [
    // Seria 1
    "116i", "118i", "120i", "125i", "M135i",
    // Seria 2
    "218i", "220i", "225xe", "M235i", "M240i",
    // Seria 3
    "318i", "320i", "325i", "330i", "335i", "M3",
    // Seria 4
    "420i", "430i", "440i", "M4",
    // Seria 5
    "520i", "525i", "530i", "540i", "M5",
    // Seria 6
    "630i", "640i", "650i", "M6",
    // Seria 7
    "730i", "740i", "750i", "760i",
    // Seria 8
    "840i", "850i", "M8",
    // X Series
    "X1", "X2", "X3", "X4", "X5", "X6", "X7",
    // Z Series
    "Z3", "Z4", "Z8",
    // i Series (Electric)
    "i3", "i4", "i7", "i8", "iX", "iX3",
  ],
  "Mercedes-Benz": [
    "Klasa A",
    "Klasa B",
    "Klasa C",
    "Klasa E",
    "Klasa S",
    "CLA",
    "CLS",
    "GLA",
    "GLB",
    "GLC",
    "GLE",
    "GLS",
    "G-Klasa",
    "AMG GT",
    "EQA",
    "EQB",
    "EQC",
    "EQS",
    "EQV",
  ],
  Porsche: ["911", "718 Boxster", "718 Cayman", "Panamera", "Macan", "Cayenne", "Taycan"],
  Jaguar: ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"],
  "Land Rover": [
    "Defender",
    "Discovery",
    "Discovery Sport",
    "Range Rover",
    "Range Rover Sport",
    "Range Rover Evoque",
    "Range Rover Velar",
  ],
  Lexus: ["IS", "ES", "GS", "LS", "CT", "NX", "RX", "GX", "LX", "LC", "RC", "UX"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck", "Roadster"],

  // MAIN CAR BRANDS
  Volkswagen: [
    "Polo",
    "Golf",
    "Jetta",
    "Passat",
    "Arteon",
    "Tiguan",
    "Touareg",
    "T-Cross",
    "T-Roc",
    "Sharan",
    "Touran",
    "Caddy",
    "Crafter",
    "ID.3",
    "ID.4",
    "ID.5",
    "ID.6",
    "ID.Buzz",
  ],
  Ford: [
    "Fiesta",
    "Focus",
    "Mondeo",
    "Mustang",
    "EcoSport",
    "Kuga",
    "Edge",
    "Explorer",
    "Puma",
    "Bronco",
    "F-150",
    "Transit",
    "Tourneo",
  ],
  Toyota: [
    "Yaris",
    "Corolla",
    "Camry",
    "Avalon",
    "C-HR",
    "RAV4",
    "Highlander",
    "Land Cruiser",
    "Prius",
    "Mirai",
    "Supra",
    "86",
    "Hilux",
    "Proace",
  ],
  Honda: ["Jazz", "Civic", "Accord", "HR-V", "CR-V", "Pilot", "Ridgeline", "Insight", "CR-Z", "NSX"],
  Hyundai: [
    "i10",
    "i20",
    "i30",
    "Elantra",
    "Sonata",
    "Kona",
    "Tucson",
    "Santa Fe",
    "Palisade",
    "IONIQ",
    "IONIQ 5",
    "IONIQ 6",
  ],
  Kia: ["Picanto", "Rio", "Ceed", "Forte", "Optima", "Stonic", "Sportage", "Sorento", "Telluride", "EV6", "Niro"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "MX-5", "CX-60"],
  Nissan: [
    "Micra",
    "Sentra",
    "Altima",
    "Maxima",
    "Juke",
    "Qashqai",
    "X-Trail",
    "Murano",
    "Pathfinder",
    "Armada",
    "370Z",
    "GT-R",
    "Leaf",
    "Ariya",
  ],
  Opel: ["Corsa", "Astra", "Insignia", "Crossland", "Grandland", "Mokka", "Combo", "Vivaro", "Movano"],
  Peugeot: ["108", "208", "308", "508", "2008", "3008", "5008", "Partner", "Expert", "Boxer", "e-208", "e-2008"],
  Renault: [
    "Twingo",
    "Clio",
    "Megane",
    "Talisman",
    "Captur",
    "Kadjar",
    "Koleos",
    "Scenic",
    "Espace",
    "Kangoo",
    "Trafic",
    "Master",
    "ZOE",
    "Megane E-Tech",
  ],
  Citroën: [
    "C1",
    "C3",
    "C4",
    "C5",
    "C3 Aircross",
    "C5 Aircross",
    "Berlingo",
    "SpaceTourer",
    "Jumpy",
    "Jumper",
    "ë-C4",
    "Ami",
  ],
  Fiat: ["500", "Panda", "Tipo", "500X", "500L", "Doblo", "Ducato", "500e"],
  Škoda: ["Citigo", "Fabia", "Scala", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Enyaq"],

  // SPECIALIST CAR BRANDS
  Jeep: ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler", "Gladiator", "Avenger"],
  Mini: ["Cooper", "Cooper S", "John Cooper Works", "Clubman", "Countryman", "Paceman", "Electric"],
  Smart: ["ForTwo", "ForFour", "EQForTwo", "EQForFour"],
  Dacia: ["Sandero", "Logan", "Duster", "Lodgy", "Dokker", "Spring"],
  Lancia: ["Ypsilon", "Delta"],
  Chrysler: ["300", "Pacifica", "Voyager"],
  Dodge: ["Challenger", "Charger", "Durango", "Journey"],

  // MOTORCYCLE BRANDS
  HondaMoto: [
    // Sport/Supersport
    "CBR600RR",
    "CBR1000RR-R",
    "CBR650R",
    "CBR500R",
    "CBR300R",
    "CBR125R",
    // Naked/Street
    "CB650R",
    "CB1000R",
    "CB500F",
    "CB300R",
    "CB125R",
    "CB650F",
    // Adventure/Touring
    "Africa Twin",
    "CRF1100L",
    "NC750X",
    "CB500X",
    "Crosstourer",
    // Cruiser
    "Rebel 500",
    "Rebel 300",
    "Shadow",
    "Fury",
    "Stateline",
    // Scooters
    "Forza 750",
    "Forza 350",
    "Forza 300",
    "Forza 125",
    "PCX 160",
    "PCX 125",
    "SH350i",
    "SH300i",
    "SH150i",
    "SH125i",
  ],
  Yamaha: [
    // Sport/Supersport
    "YZF-R1",
    "YZF-R1M",
    "YZF-R6",
    "YZF-R7",
    "YZF-R3",
    "YZF-R125",
    // Naked/Street
    "MT-10",
    "MT-09",
    "MT-07",
    "MT-03",
    "MT-125",
    "MT-15",
    // Adventure/Touring
    "Ténéré 700",
    "Super Ténéré",
    "Tracer 9",
    "Tracer 7",
    "FJR1300",
    // Cruiser
    "VMAX",
    "Bolt",
    "Star Venture",
    "Star Eluder",
    // Scooters
    "TMAX 560",
    "TMAX 530",
    "XMAX 400",
    "XMAX 300",
    "XMAX 125",
    "NMAX 155",
    "NMAX 125",
    "Aerox 155",
    "Aerox 125",
  ],
  Suzuki: [
    // Sport/Supersport
    "GSX-R1000",
    "GSX-R750",
    "GSX-R600",
    "GSX-R125",
    // Naked/Street
    "GSX-S1000",
    "GSX-S750",
    "GSX-S125",
    "SV650",
    // Adventure
    "V-Strom 1050",
    "V-Strom 650",
    "V-Strom 250",
    // Cruiser
    "Boulevard M109R",
    "Boulevard C90",
    "Boulevard S40",
    // Scooters
    "Burgman 650",
    "Burgman 400",
    "Burgman 200",
    "Address 125",
  ],
  Kawasaki: [
    // Sport/Supersport
    "Ninja ZX-10R",
    "Ninja ZX-6R",
    "Ninja 650",
    "Ninja 400",
    "Ninja 300",
    "Ninja 125",
    // Naked/Street
    "Z H2",
    "Z1000",
    "Z900",
    "Z650",
    "Z400",
    "Z300",
    "Z125",
    // Adventure
    "Versys 1000",
    "Versys 650",
    "Versys-X 300",
    // Cruiser
    "Vulcan S",
    "Vulcan 900",
    "Vulcan 1700",
  ],
  BMWMoto: [
    // R Series (Adventure/Touring)
    "R 12 nineT", "R 18", "R 1250 GS", "R 1250 RT", "R 1300 GS", "R nineT", "R 1200 GS", "R 1150 GS",
    // S Series (Sport)
    "S 1000 RR", "S 1000 R", "S 1000 XR", "S 1000 F",
    // F Series (Adventure/Naked)
    "F 900 GS", "F 900 R", "F 850 GS", "F 800 GS", "F 750 GS", "F 650 GS",
    // K Series (Touring)
    "K 1600 GT", "K 1600 GTL", "K 1300 S", "K 1200 RS",
    // G Series (Entry Level)
    "G 310 GS", "G 310 R",
    // C Series (Scooters)
    "C 400 X", "C 400 GT", "C 650 GT", "C 650 Sport",
    // CE Series (Electric)
    "CE 02", "CE 04",
  ],
  Ducati: [
    // Supersport
    "Panigale V4",
    "Panigale V2",
    "SuperSport 950",
    // Naked
    "Streetfighter V4",
    "Streetfighter V2",
    "Monster 937",
    "Monster 821",
    // Adventure
    "Multistrada V4",
    "Multistrada 950",
    "DesertX",
    // Cruiser
    "Diavel V4",
    "XDiavel",
    // Heritage
    "Scrambler Icon",
    "Scrambler Desert Sled",
    "Scrambler Cafe Racer",
  ],
  KTM: [
    // Sport
    "RC 390",
    "RC 200",
    "RC 125",
    // Naked
    "1290 Super Duke R",
    "890 Duke R",
    "790 Duke",
    "390 Duke",
    "250 Duke",
    "125 Duke",
    // Adventure
    "1290 Super Adventure",
    "890 Adventure",
    "790 Adventure",
    "390 Adventure",
    // Enduro
    "500 EXC-F",
    "450 EXC-F",
    "350 EXC-F",
    "250 EXC-F",
  ],
  Triumph: [
    // Sport
    "Daytona 765",
    "Speed Triple 1200",
    "Street Triple 765",
    // Adventure
    "Tiger 1200",
    "Tiger 900",
    "Tiger 800",
    // Cruiser
    "Rocket 3",
    "Thunderbird",
    "America",
    // Heritage
    "Bonneville T120",
    "Bonneville T100",
    "Scrambler 1200",
    "Thruxton 1200",
  ],
  Aprilia: [
    // Sport
    "RSV4",
    "RS 660",
    "RS4 125",
    "RS 125",
    // Naked
    "Tuono V4",
    "Tuono 660",
    "Shiver 900",
    // Scooters
    "SRV 850",
    "Scarabeo 500",
    "SR MAX 300",
    "SR 50",
  ],
  "Moto Guzzi": ["V100 Mandello", "V85 TT", "V7", "V9", "Audace", "California"],
  Husqvarna: ["Vitpilen 701", "Vitpilen 401", "Svartpilen 701", "Svartpilen 401", "Norden 901"],
  "Harley-Davidson": [
    // Touring
    "Road Glide",
    "Street Glide",
    "Electra Glide",
    "Road King",
    // Cruiser
    "Fat Boy",
    "Heritage Classic",
    "Softail Standard",
    "Low Rider",
    // Sport
    "Sportster S",
    "Iron 883",
    "Iron 1200",
    "Forty-Eight",
    // Adventure
    "Pan America 1250",
    // Electric
    "LiveWire",
  ],
  Indian: ["Chief", "Chieftain", "Roadmaster", "Scout", "FTR", "Challenger"],
  Victory: ["Cross Country", "Magnum", "Vegas", "Gunner"],
  Buell: ["1125R", "1125CR", "XB12R", "XB9R"],
  Benelli: ["TNT 600i", "TNT 300", "TNT 125", "Leoncino 500", "TRK 502"],
  CFMoto: ["650NK", "650MT", "400NK", "300NK", "150NK"],
  Zontes: ["ZT310-R", "ZT310-T", "ZT125-U", "ZT125-G"],
  Junak: ["M16", "M12", "M10", "M8"],
  Romet: ["ADV 400", "ADV 250", "RXS 125", "RXS 50"],
  Barton: ["Hyper 125", "Raptor 125", "Force 125"],
  Sym: ["Maxsym TL 500", "Maxsym 400i", "Citycom 300i", "Jet 14", "Orbit 125"],
  Kymco: ["AK 550", "Xciting 400i", "Downtown 350i", "People S 300i", "Agility 125"],
  Piaggio: ["Beverly 400", "Beverly 300", "X-Evo 400", "Liberty 150", "Zip 125"],
}

export const CAR_BODY_TYPES = [
  "Sedan",
  "Hatchback",
  "Kombi/Estate",
  "Coupe",
  "Kabriolet",
  "SUV Compact",
  "SUV Mid-size",
  "SUV Full-size",
  "Crossover",
  "Van",
  "Pickup",
]

export const CAR_SEGMENTS = [
  "Miejski",
  "Kompaktowy",
  "Klasa średnia",
  "Klasa wyższa",
  "Luksusowy",
  "Sportowy",
  "Terenowy",
  "Użytkowy",
]

export const MOTORCYCLE_TYPES = [
  // Sportowe
  "Supersport",
  "Sport",
  "Naked",
  "Streetfighter",
  // Turystyczne
  "Touring",
  "Adventure",
  "Enduro",
  // Cruiser
  "Cruiser",
  "Chopper",
  "Bobber",
  "Scrambler",
  // Terenowe
  "Cross",
  "Trial",
  "Supermoto",
  // Skutery
  "Skuter 50cc",
  "Skuter 125cc",
  "Skuter 250cc",
  "Skuter 400cc+",
]

export const MOTORCYCLE_CAPACITIES = [
  "50cc",
  "125cc",
  "250cc",
  "300cc",
  "400cc",
  "500cc",
  "600cc",
  "650cc",
  "750cc",
  "800cc",
  "900cc",
  "1000cc",
  "1100cc",
  "1200cc",
  "1300cc",
  "1400cc+",
]

export const MOTORCYCLE_LICENSE_CATEGORIES = ["AM (do 50cc)", "A1 (do 125cc)", "A2 (do 35kW)", "A (bez ograniczeń)"]

export const FUEL_TYPES = ["Benzyna", "Diesel", "LPG", "Hybryda", "Elektryczny", "Wodór"]

export const TRANSMISSION_TYPES = ["Manualna", "Automatyczna", "Półautomatyczna", "CVT"]

export const DRIVE_TYPES = ["Na przednie koła", "Na tylne koła", "4x4 (dołączany)", "4x4 (stały)"]

export const VEHICLE_CONDITIONS = ["Nowy", "Używany", "Uszkodzony", "Po kolizji", "Do remontu"]

export const CURRENCIES = ["CHF", "EUR", "USD"]

export const COUNTRIES = [
  "Szwajcaria",
  "Niemcy",
  "Austria",
  "Francja",
  "Włochy",
  "Liechtenstein",
  "Polska",
  "Czechy",
  "Słowacja",
  "Węgry",
]

export const FINANCING_OPTIONS = [
  "Leasing dostępny",
  "Finansowanie 0%",
  "Kredyt samochodowy",
  "Wymiana pojazdu",
  "Gwarancja rozszerzona",
]

export const TRANSPORT_OPTIONS = [
  "Odbiór osobisty",
  "Transport krajowy",
  "Transport międzynarodowy",
  "Dostawa do domu",
  "Punkt odbioru",
]
