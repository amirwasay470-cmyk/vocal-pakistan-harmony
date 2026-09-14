import { useMemo, useState, useEffect } from "react";
import {
  Bike,
  Car,
  Bus,
  Fuel,
  Route,
  CalendarDays,
  PiggyBank,
  TrendingDown,
  Lightbulb,
  BookmarkPlus,
  CheckCircle2,
  Gauge,
  Droplets,
  Wrench,
  Navigation,
  Flame,
  Settings2,
  Check,
  ShieldAlert,
  Repeat,
} from "lucide-react";
import { pkr } from "@/lib/awaaz-data";
import { SectionHead, Field } from "@/components/awaaz/BillAudit";
import { useLiveRates } from "@/lib/live-sync";
import { usePersistentState } from "@/lib/use-persistent-state";
import { ShareReportButton } from "@/components/awaaz/ShareReportButton";

export type VehicleCategory =
  "bike70" | "bike125" | "smallCar" | "sedan" | "suv" | "rickshaw" | "public";

export type VehicleModel = {
  id: string;
  name: string;
  category: VehicleCategory;
  defaultKmPerLitre: number | null;
  farePerKm?: number;
  engineSpec: string;
  tyrePsi: string;
  oilGrade: string;
  localAdvice: string;
};

export const VEHICLE_CATEGORIES: { id: VehicleCategory; label: string; icon: React.ReactNode }[] = [
  { id: "bike70", label: "70cc Bikes", icon: <Bike className="h-4 w-4" /> },
  { id: "bike125", label: "100-150cc Bikes", icon: <Bike className="h-4 w-4" /> },
  { id: "smallCar", label: "Small Cars (660-1000cc)", icon: <Car className="h-4 w-4" /> },
  { id: "sedan", label: "Sedans (1.2-1.8L)", icon: <Car className="h-4 w-4" /> },
  { id: "suv", label: "SUVs & Crossovers", icon: <Car className="h-4 w-4" /> },
  { id: "rickshaw", label: "Rickshaw / Qingqi", icon: <Bike className="h-4 w-4" /> },
  { id: "public", label: "Public Bus / Metro", icon: <Bus className="h-4 w-4" /> },
];

export const VEHICLE_MODELS: VehicleModel[] = [
  // 70cc Motorcycles
  {
    id: "honda_cd70",
    name: "Honda CD 70",
    category: "bike70",
    defaultKmPerLitre: 52,
    engineSpec: "72cc 4-Stroke Single OHC",
    tyrePsi: "Front: 28 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 4T (0.7 Litre)",
    localAdvice:
      "Ustad Advice: Keep carburettor fuel needle on 3rd slot. Replace NGK C7HSA plug every 10,000 km. Don't run with under-inflated rear tyre as it drops mileage from 52 to 44 km/L.",
  },
  {
    id: "unique_70",
    name: "Unique UD 70",
    category: "bike70",
    defaultKmPerLitre: 46,
    engineSpec: "70cc Chinese-Euro II Single",
    tyrePsi: "Front: 28 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 (0.7 Litre)",
    localAdvice:
      "Tuning Tip: Check tappet valve clearances every 3 months. Chinese carburettors tend to run rich; get air screw adjusted for clean Pakistani fuel burn.",
  },
  {
    id: "super_star_70",
    name: "Super Star SS 70",
    category: "bike70",
    defaultKmPerLitre: 45,
    engineSpec: "70cc Euro II Single",
    tyrePsi: "Front: 28 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 (0.7 Litre)",
    localAdvice:
      "Maintenance Tip: Wash foam air filter in kerosene monthly. Clean carburettor jet every 6 months to maintain 45+ km/L on city roads.",
  },
  {
    id: "united_70",
    name: "United US 70",
    category: "bike70",
    defaultKmPerLitre: 47,
    engineSpec: "70cc Single Cylinder 4T",
    tyrePsi: "Front: 28 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 (0.7 Litre)",
    localAdvice:
      "Daily Habit: Avoid sudden hard throttle pulls from standstill. Gentle acceleration in 3rd and 4th gear maximizes mileage.",
  },
  {
    id: "road_prince_70",
    name: "Road Prince Passion 70",
    category: "bike70",
    defaultKmPerLitre: 45,
    engineSpec: "70cc 4-Stroke",
    tyrePsi: "Front: 28 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 (0.7 Litre)",
    localAdvice:
      "Check chain tension regularly. A slack chain adds transmission drag and reduces fuel economy.",
  },

  // 100cc - 150cc Motorcycles
  {
    id: "honda_cg125",
    name: "Honda CG 125",
    category: "bike125",
    defaultKmPerLitre: 38,
    engineSpec: "124cc 4-Stroke OHV (Pushrod)",
    tyrePsi: "Front: 28 PSI | Rear: 33 PSI",
    oilGrade: "20W-50 4T (1.0 Litre)",
    localAdvice:
      "Pakistani Classic: CG 125 OHV engine drinks fuel heavily above 5,000 RPM. Cruising in 4th gear at 50-60 km/h yields ~42 km/L; aggressive revving at signals drops it to 32 km/L.",
  },
  {
    id: "honda_cb125f",
    name: "Honda CB 125F",
    category: "bike125",
    defaultKmPerLitre: 42,
    engineSpec: "124cc 5-Speed OHC Balancer",
    tyrePsi: "Front: 29 PSI | Rear: 33 PSI",
    oilGrade: "10W-30 or 10W-40 (1.0 Litre)",
    localAdvice:
      "5-speed gearbox gives excellent highway economy. Shift early to 5th gear on open roads for 45+ km/L.",
  },
  {
    id: "yamaha_ybr125",
    name: "Yamaha YBR 125 / YBR-G",
    category: "bike125",
    defaultKmPerLitre: 44,
    engineSpec: "124cc SOHC Balancer Engine",
    tyrePsi: "Front: 25 PSI | Rear: 33 PSI",
    oilGrade: "10W-40 Yamalube (1.0 Litre)",
    localAdvice:
      "Smooth OHC engine. Clean the dry paper air element with compressed air (never soak in petrol). Keep tyre pressure exact for best suspension and mileage.",
  },
  {
    id: "suzuki_gs150",
    name: "Suzuki GS 150 / GR 150",
    category: "bike125",
    defaultKmPerLitre: 36,
    engineSpec: "150cc SOHC 5-Speed",
    tyrePsi: "Front: 28 PSI | Rear: 34 PSI",
    oilGrade: "20W-50 or 10W-40 (1.0 Litre)",
    localAdvice:
      "Larger 150cc displacement requires periodic carburettor sync and diaphragm inspection. Good highway runner at 70 km/h.",
  },
  {
    id: "honda_pridor",
    name: "Honda Pridor 100cc",
    category: "bike125",
    defaultKmPerLitre: 48,
    engineSpec: "100cc 4-Stroke OHC",
    tyrePsi: "Front: 28 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 4T (0.8 Litre)",
    localAdvice:
      "Remarkably economical 100cc engine. One of Pakistan's best mileage-to-comfort commuter bikes.",
  },

  // Small Cars / Hatchbacks (660cc - 1000cc)
  {
    id: "suzuki_alto_660",
    name: "Suzuki Alto 660cc (VXR/VXL/AGS)",
    category: "smallCar",
    defaultKmPerLitre: 19.5,
    engineSpec: "R06A 658cc EFI Engine",
    tyrePsi: "36 PSI all four tyres (Cold)",
    oilGrade: "0W-20 or 5W-30 Fully Synthetic",
    localAdvice:
      "Golden Rule: NEVER put thick 20W-50 oil in 660cc Alto! Thick oil ruins fuel economy and VVT solenoids. Keep tyre pressure at recommended 36 PSI for 19-21 km/L city average.",
  },
  {
    id: "suzuki_mehran",
    name: "Suzuki Mehran 800cc (The Boss)",
    category: "smallCar",
    defaultKmPerLitre: 13.5,
    engineSpec: "796cc F8B 3-Cylinder",
    tyrePsi: "28-30 PSI all tyres",
    oilGrade: "20W-50 (2.7 Litre)",
    localAdvice:
      "Tuning Advice: Inspect points/electronic distributor and vacuum advance pipe. Clean carburettor jets every 15,000 km to avoid fuel overflow.",
  },
  {
    id: "suzuki_cultus_efi",
    name: "Suzuki Cultus 1000cc (K10B)",
    category: "smallCar",
    defaultKmPerLitre: 15.5,
    engineSpec: "998cc K10B 3-Cylinder DOHC",
    tyrePsi: "32 PSI all tyres",
    oilGrade: "5W-30 or 10W-40 (3.1 Litre)",
    localAdvice:
      "Keep throttle body clean and change air filter every 5,000 km. Gentle throttle in 3rd and 4th gear gives 16+ km/L in Lahore/Karachi traffic.",
  },
  {
    id: "suzuki_wagonr",
    name: "Suzuki Wagon R 1000cc (K10B)",
    category: "smallCar",
    defaultKmPerLitre: 15.0,
    engineSpec: "998cc K10B Engine",
    tyrePsi: "32 PSI all tyres",
    oilGrade: "5W-30 or 10W-40 (3.1 Litre)",
    localAdvice:
      "Tall boy design has higher aerodynamic drag on ring roads above 80 km/h. Keep speed steady at 70-80 km/h for maximum fuel economy.",
  },
  {
    id: "daihatsu_mira",
    name: "Daihatsu Mira / Move 660cc JDM",
    category: "smallCar",
    defaultKmPerLitre: 18.5,
    engineSpec: "KF-VE 658cc with CVT Transmission",
    tyrePsi: "34-36 PSI",
    oilGrade: "0W-20 Synthetic",
    localAdvice:
      "CVT driving technique: don't floor the gas pedal. Let the transmission 'rubber-band' gently to speed to keep engine below 2,000 RPM.",
  },
  {
    id: "toyota_vitz",
    name: "Toyota Vitz 1000cc (1KR-FE)",
    category: "smallCar",
    defaultKmPerLitre: 14.0,
    engineSpec: "996cc 1KR-FE 3-Cylinder",
    tyrePsi: "32 PSI",
    oilGrade: "5W-20 or 5W-30 (3.0 Litre)",
    localAdvice:
      "Clean oxygen (O2) sensor and MAF sensor with MAF cleaner spray if mileage drops below 13 km/L in city conditions.",
  },
  {
    id: "changan_karvaan",
    name: "Changan Karvaan 1000cc MPV",
    category: "smallCar",
    defaultKmPerLitre: 11.5,
    engineSpec: "999cc C10 4-Cylinder",
    tyrePsi: "34 PSI front | 40 PSI rear (Loaded)",
    oilGrade: "10W-40 (3.5 Litre)",
    localAdvice:
      "When loaded with passengers/goods, avoid lugging in 4th gear at low speed; shift down to 3rd to avoid unburnt fuel wash.",
  },

  // Sedans (1.2L - 1.8L)
  {
    id: "toyota_corolla",
    name: "Toyota Corolla (GLi / Altis 1.3/1.6)",
    category: "sedan",
    defaultKmPerLitre: 12.5,
    engineSpec: "1NZ-FE 1.3L / 1ZR-FE 1.6L Dual VVT-i",
    tyrePsi: "30-32 PSI cold",
    oilGrade: "5W-30 or 10W-40 (3.7 Litre)",
    localAdvice:
      "The national sedan: Clean throttle body and service fuel injectors every 40,000 km. AC thermistor check saves up to Rs. 4,000 fuel per month.",
  },
  {
    id: "toyota_yaris",
    name: "Toyota Yaris (1.3 / 1.5 CVT)",
    category: "sedan",
    defaultKmPerLitre: 14.0,
    engineSpec: "2NR-FE 1.5L / 1NR-FE 1.3L CVT",
    tyrePsi: "32 PSI all tyres",
    oilGrade: "0W-20 or 5W-30 (3.5 Litre)",
    localAdvice:
      "CVT 7-speed stepped mode: Eco indicator light on dashboard helps you stay in optimal fuel band.",
  },
  {
    id: "honda_city",
    name: "Honda City (1.2 / 1.5 i-VTEC)",
    category: "sedan",
    defaultKmPerLitre: 14.2,
    engineSpec: "L12B / L15A i-VTEC Engine",
    tyrePsi: "30-32 PSI",
    oilGrade: "0W-20 or 5W-30 (3.6 Litre)",
    localAdvice:
      "i-VTEC profile gives great mileage under 2,500 RPM. Clean EGR valve if experiencing slight hesitation at signal take-offs.",
  },
  {
    id: "honda_civic",
    name: "Honda Civic (Oriel / RS Turbo 1.5/1.8)",
    category: "sedan",
    defaultKmPerLitre: 10.5,
    engineSpec: "R18Z 1.8L / L15B7 1.5L Turbo",
    tyrePsi: "32 PSI",
    oilGrade: "0W-20 Fully Synthetic",
    localAdvice:
      "For 1.5 Turbo: Use Hi-Octane (RON 95/97) blend to prevent engine knocking and maintain boost economy. Check intercooler cleanliness.",
  },
  {
    id: "suzuki_swift",
    name: "Suzuki Swift 1.2 Dualjet",
    category: "sedan",
    defaultKmPerLitre: 13.5,
    engineSpec: "K12M 1.2L Dualjet",
    tyrePsi: "32 PSI",
    oilGrade: "0W-20 or 5W-30 (3.1 Litre)",
    localAdvice:
      "Dualjet injection is very efficient; keep fuel filter and air intake spotless for snappy throttle and high km/L.",
  },
  {
    id: "hyundai_elantra",
    name: "Hyundai Elantra (1.6 / 2.0)",
    category: "sedan",
    defaultKmPerLitre: 10.0,
    engineSpec: "Gamma 1.6L / Nu 2.0L 6-Speed Auto",
    tyrePsi: "33 PSI",
    oilGrade: "5W-30 (4.0 Litre)",
    localAdvice:
      "Drive in 'Smart' or 'Eco' drive mode in city traffic to delay downshifts and smooth out fuel burn.",
  },

  // Crossovers & SUVs
  {
    id: "kia_sportage",
    name: "Kia Sportage (2.0 FWD/AWD)",
    category: "suv",
    defaultKmPerLitre: 9.5,
    engineSpec: "2.0L Nu MPI 6-Speed Auto",
    tyrePsi: "35 PSI cold",
    oilGrade: "5W-30 (4.0 Litre)",
    localAdvice:
      "Heavy 1,500 kg chassis: Frequent braking and accelerating in stop-and-go burns high fuel. Coast early towards signals.",
  },
  {
    id: "hyundai_tucson",
    name: "Hyundai Tucson (2.0 AWD/FWD)",
    category: "suv",
    defaultKmPerLitre: 9.0,
    engineSpec: "2.0L MPI Engine",
    tyrePsi: "35 PSI",
    oilGrade: "5W-30 (4.0 Litre)",
    localAdvice:
      "Keep tyre pressure strictly at 35 PSI. Running at 28 PSI on Pakistani potholes increases fuel consumption by 10%.",
  },
  {
    id: "mg_hs",
    name: "MG HS (1.5 Turbo)",
    category: "suv",
    defaultKmPerLitre: 9.2,
    engineSpec: "1.5L Turbo GDI 7-Speed DCT",
    tyrePsi: "34-36 PSI",
    oilGrade: "5W-30 Synthetic (4.0 Litre)",
    localAdvice:
      "Turbo GDI requires quality fuel and clean spark plugs. Avoid aggressive starts from standstills to protect DCT clutch packs.",
  },
  {
    id: "haval_h6",
    name: "Haval H6 1.5T / HEV Hybrid",
    category: "suv",
    defaultKmPerLitre: 14.5,
    engineSpec: "1.5L Turbo Hybrid Dedicated DHT",
    tyrePsi: "34 PSI",
    oilGrade: "0W-20 Synthetic",
    localAdvice:
      "Hybrid battery regenerative braking shines in bumper-to-bumper city traffic; smooth braking maximizes electric energy recoup.",
  },
  {
    id: "toyota_fortuner_petrol",
    name: "Toyota Fortuner 2.7 Petrol (2TR-FE)",
    category: "suv",
    defaultKmPerLitre: 7.0,
    engineSpec: "2.7L 4-Cylinder Petrol Dual VVT-i",
    tyrePsi: "30 PSI cold",
    oilGrade: "5W-30 (5.6 Litre)",
    localAdvice:
      "Large naturally aspirated petrol engine in 2-ton SUV: High fuel burn is expected. Drive with light foot in Eco mode.",
  },
  {
    id: "toyota_fortuner_diesel",
    name: "Toyota Fortuner 2.8 Diesel (1GD-FTV)",
    category: "suv",
    defaultKmPerLitre: 9.8,
    engineSpec: "2.8L D-4D Turbo Diesel Intercooler",
    tyrePsi: "30 PSI cold",
    oilGrade: "5W-30 / 15W-40 Diesel (7.5 Litre)",
    localAdvice:
      "Drain water separator filter in fuel line every 5,000 km to protect common-rail injectors from substandard local diesel.",
  },

  // Auto Rickshaw & Qingqi
  {
    id: "auto_rickshaw",
    name: "4-Stroke Auto Rickshaw (Sazgar/Piaggio/New Asia)",
    category: "rickshaw",
    defaultKmPerLitre: 22.0,
    engineSpec: "200cc 4-Stroke Air-Cooled Single",
    tyrePsi: "Front: 25 PSI | Rear: 32 PSI",
    oilGrade: "20W-50 4T (1.0 Litre)",
    localAdvice:
      "Ustad Rickshaw Tip: Regularly check carburettor needle and main jet. Never overload beyond passenger limits on inclines.",
  },
  {
    id: "qingqi_loader",
    name: "Qingqi 70cc / 100cc Passenger/Loader",
    category: "rickshaw",
    defaultKmPerLitre: 24.0,
    engineSpec: "70cc / 100cc Heavy Duty Single",
    tyrePsi: "Front: 28 PSI | Rear: 40 PSI",
    oilGrade: "20W-50 (0.9 Litre)",
    localAdvice:
      "Ensure rear axle differential grease is topped up and brakes are not binding against drums.",
  },

  // Public Transport
  {
    id: "metro_speedo",
    name: "Metro Bus / Feeder Speedo / Orange Line Train",
    category: "public",
    defaultKmPerLitre: null,
    farePerKm: 6,
    engineSpec: "Dedicated Transit Corridor",
    tyrePsi: "N/A (Public Transit)",
    oilGrade: "N/A",
    localAdvice:
      "Subsidized public transit: Fixed card fare (Rs. 30-50 per ride regardless of distance). The most economical option across Lahore, Rawalpindi-Islamabad, Multan, and Peshawar.",
  },
  {
    id: "local_wagon",
    name: "Local Wagon / Mini-van / Coaster",
    category: "public",
    defaultKmPerLitre: null,
    farePerKm: 14,
    engineSpec: "Commercial Transit Routes",
    tyrePsi: "N/A",
    oilGrade: "N/A",
    localAdvice:
      "Local stop-to-stop vans: Fares range from Rs. 40 to Rs. 150 depending on stage distance. Safe for daily office commutes.",
  },
];

export type FuelType = {
  id: "petrol" | "diesel" | "lpg";
  name: string;
  price: number;
  unit: string;
};

export const FUEL_TYPES: FuelType[] = [
  { id: "petrol", name: "Petrol (Super)", price: 375.82, unit: "Litre" },
  { id: "diesel", name: "High Speed Diesel (HSD)", price: 403.32, unit: "Litre" },
  { id: "lpg", name: "Auto LPG", price: 258.0, unit: "kg" },
];

export type StrategyId = "tuneup" | "route" | "transit";

export const STRATEGIES = [
  {
    id: "tuneup" as StrategyId,
    name: "Model Tuning & Air/Pressure Service",
    short: "Tune-up & PSI",
    icon: <Wrench className="h-4 w-4" />,
    savingFraction: 0.12,
    note: "Proper spark plug gap, air filter cleanout, and exact cold tyre PSI saves 10–12% fuel on Pakistani asphalt.",
  },
  {
    id: "route" as StrategyId,
    name: "Choke-Point & Rush-Hour Bypass",
    short: "Route Shift",
    icon: <Navigation className="h-4 w-4" />,
    savingFraction: 0.15,
    note: "Avoiding major bottlenecks (idling in 1st gear) saves ~15% fuel and prevents clutch plate burnout.",
  },
  {
    id: "transit" as StrategyId,
    name: "Hybrid: 2 Days Metro/Wagon Swap",
    short: "Public Transit Combo",
    icon: <Bus className="h-4 w-4" />,
    savingFraction: 0.22,
    note: "Park your bike/car 2 days a week and ride Metro/Speedo to retain massive monthly cash.",
  },
];

export function CommuteCalculator() {
  const { fuel } = useLiveRates();
  const [selectedCategory, setSelectedCategory] = usePersistentState<VehicleCategory>(
    "awaaz_commute_category",
    "bike70",
  );
  const [selectedModelId, setSelectedModelId] = usePersistentState<string>(
    "awaaz_commute_model",
    "honda_cd70",
  );
  const [dailyKm, setDailyKm] = usePersistentState<number>("awaaz_commute_daily_km", 30);
  const [travelDays, setTravelDays] = usePersistentState<number>("awaaz_commute_travel_days", 24);
  const [fuelId, setFuelId] = usePersistentState<"petrol" | "diesel" | "lpg">(
    "awaaz_commute_fuel_id",
    "petrol",
  );
  const [fuelPrice, setFuelPrice] = useState<number>(375.82);
  const [customKmPerLitre, setCustomKmPerLitre] = useState<number>(52);
  const [isCustomMileage, setIsCustomMileage] = useState<boolean>(false);
  const [selectedStrategy, setSelectedStrategy] = usePersistentState<StrategyId>(
    "awaaz_commute_strategy",
    "tuneup",
  );
  const [savedPlan, setSavedPlan] = useState<boolean>(false);
  const [viewPeriod, setViewPeriod] = usePersistentState<"monthly" | "daily">(
    "awaaz_commute_view_period",
    "monthly",
  );

  // Sync live fuel price when live rates update or fuelId changes
  useEffect(() => {
    if (fuelId === "petrol") setFuelPrice(fuel.petrol || 375.82);
    else if (fuelId === "diesel") setFuelPrice(fuel.diesel || 403.32);
    else if (fuelId === "lpg") setFuelPrice(fuel.lpg || 258.0);
  }, [fuelId, fuel]);

  // Active vehicle model
  const activeModel = useMemo(() => {
    return VEHICLE_MODELS.find((m) => m.id === selectedModelId) || VEHICLE_MODELS[0];
  }, [selectedModelId]);

  // Dynamic fuel types with live sync rates
  const liveFuelTypes: FuelType[] = useMemo(
    () => [
      { id: "petrol", name: "Petrol (Super)", price: fuel.petrol || 375.82, unit: "Litre" },
      {
        id: "diesel",
        name: "High Speed Diesel (HSD)",
        price: fuel.diesel || 403.32,
        unit: "Litre",
      },
      { id: "lpg", name: "Auto LPG", price: fuel.lpg || 258.0, unit: "kg" },
    ],
    [fuel],
  );

  // Handle category switch: auto-select first model in that category
  const handleCategoryChange = (cat: VehicleCategory) => {
    setSelectedCategory(cat);
    const firstInCat = VEHICLE_MODELS.find((m) => m.category === cat);
    if (firstInCat) {
      setSelectedModelId(firstInCat.id);
      if (firstInCat.defaultKmPerLitre !== null) {
        setCustomKmPerLitre(firstInCat.defaultKmPerLitre);
      }
      setIsCustomMileage(false);
      // Auto switch fuel if model is diesel
      if (firstInCat.id.includes("diesel")) {
        setFuelId("diesel");
        setFuelPrice(fuel.diesel || 403.32);
      } else if (firstInCat.category !== "public") {
        setFuelId("petrol");
        setFuelPrice(fuel.petrol || 375.82);
      }
    }
  };

  // Handle specific model switch
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    const model = VEHICLE_MODELS.find((m) => m.id === modelId);
    if (model) {
      if (model.defaultKmPerLitre !== null) {
        setCustomKmPerLitre(model.defaultKmPerLitre);
      }
      setIsCustomMileage(false);
      if (model.id.includes("diesel")) {
        setFuelId("diesel");
        setFuelPrice(fuel.diesel || 403.32);
      }
    }
    setSavedPlan(false);
  };

  const isPublic = activeModel.defaultKmPerLitre === null;
  const effectiveMileage = isPublic
    ? null
    : isCustomMileage
      ? customKmPerLitre
      : activeModel.defaultKmPerLitre || 50;

  // Calculations
  const metrics = useMemo(() => {
    const monthlyKm = dailyKm * travelDays;

    let dailyCost = 0;
    let monthlyCost = 0;
    let monthlyLitres = 0;
    let dailyLitres = 0;

    if (isPublic) {
      const fareKm = activeModel.farePerKm || 12;
      dailyCost = dailyKm * fareKm;
      monthlyCost = monthlyKm * fareKm;
    } else {
      const kmL = effectiveMileage && effectiveMileage > 0 ? effectiveMileage : 1;
      dailyLitres = dailyKm / kmL;
      dailyCost = dailyLitres * fuelPrice;
      monthlyLitres = monthlyKm / kmL;
      monthlyCost = monthlyLitres * fuelPrice;
    }

    const strat = STRATEGIES.find((s) => s.id === selectedStrategy)!;
    let optimizedMonthlyCost = 0;

    if (selectedStrategy === "transit") {
      // 2 days per week shifted to transit (~35% shift)
      const fractionShift = 2 / 5.5;
      const shiftedVehicleCost = monthlyCost * (1 - fractionShift);
      const transitCost = monthlyKm * fractionShift * 10; // affordable metro/van fare
      optimizedMonthlyCost = shiftedVehicleCost + transitCost;
    } else {
      optimizedMonthlyCost = monthlyCost * (1 - strat.savingFraction);
    }

    const monthlySavings = Math.max(0, monthlyCost - optimizedMonthlyCost);
    const yearlySavings = monthlySavings * 12;
    const savingsPct = monthlyCost > 0 ? (monthlySavings / monthlyCost) * 100 : 0;

    return {
      dailyKm,
      monthlyKm,
      dailyCost,
      monthlyCost,
      dailyLitres,
      monthlyLitres,
      optimizedMonthlyCost,
      monthlySavings,
      yearlySavings,
      savingsPct,
      annualCost: monthlyCost * 12,
    };
  }, [dailyKm, travelDays, isPublic, effectiveMileage, fuelPrice, activeModel, selectedStrategy]);

  const fuelObj = FUEL_TYPES.find((f) => f.id === fuelId) || FUEL_TYPES[0];

  return (
    <div className="tab-enter space-y-6">
      <SectionHead
        icon={<Route className="h-6 w-6 text-emerald-400" />}
        title="Rozana Safar Aur Petrol/Diesel Ka Kharcha"
        subtitle="Apni gaari ya bike ka exact model muntakhib karein aur rozana ka petrol kharcha aur bachat check karein."
      />

      {/* ── Reference Fuel Price Strip (Simple & Clear) ─────────── */}
      <div className="glass-card p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              Current Fuel Rates (Pakistan OGRA Live Feeds)
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Select to apply active OGRA pump rate
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {liveFuelTypes.map((f) => {
            const active = f.id === fuelId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFuelId(f.id as "petrol" | "diesel" | "lpg");
                  setFuelPrice(f.price);
                  setSavedPlan(false);
                }}
                disabled={isPublic}
                className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                } ${isPublic ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-400">{f.name}</p>
                  <p className="text-lg font-black text-white">Rs. {f.price.toFixed(2)}</p>
                </div>
                <span className="text-xs font-mono text-slate-400">per {f.unit}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* ── Left Column: Vehicle Selection & Commute Pattern ──── */}
        <div className="glass-card p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Car className="h-5 w-5 text-emerald-400" />
              1. Gaari / Bike Ka Category Muntakhib Karein
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select category to see exact models (Honda CD 70, Unique, Alto, Cultus, Corolla, etc.)
            </p>
          </div>

          {/* Category Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {VEHICLE_CATEGORIES.map((cat) => {
              const active = cat.id === selectedCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-emerald-400" : "text-slate-400"}>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Exact Model Dropdown / Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Exact Model Muntakhib Karein (Make & Variant):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VEHICLE_MODELS.filter((m) => m.category === selectedCategory).map((m) => {
                const active = m.id === selectedModelId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModelChange(m.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500"
                        : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-white">{m.name}</span>
                      {active && <Check className="h-4 w-4 text-emerald-400" />}
                    </div>
                    <span className="text-xs text-emerald-400 font-mono mt-0.5">
                      {m.defaultKmPerLitre
                        ? `Average: ~${m.defaultKmPerLitre} km/L`
                        : "Public Transit"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 truncate w-full">
                      {m.engineSpec}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model-specific Mileage Adjuster (if not public transit) */}
          {!isPublic && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white">Fuel Average (Mileage):</span>
                  <p className="text-xs text-slate-400">
                    Standard road average: <strong>{activeModel.defaultKmPerLitre} km/L</strong>.
                    Agar aapka bike/car kam ya zyada average de raha hai to yahan adjust karein:
                  </p>
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {effectiveMileage} km/L
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={75}
                  step={1}
                  value={effectiveMileage || 50}
                  onChange={(e) => {
                    setCustomKmPerLitre(Number(e.target.value));
                    setIsCustomMileage(true);
                  }}
                  className="w-full accent-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMileage(false);
                    if (activeModel.defaultKmPerLitre) {
                      setCustomKmPerLitre(activeModel.defaultKmPerLitre);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 underline whitespace-nowrap"
                >
                  Reset Factory
                </button>
              </div>
            </div>
          )}

          {/* Commute Distance & Working Days */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Route className="h-4 w-4 text-emerald-400" />
              2. Rozana Safar Ki Tafseelat (Daily Commute)
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Rozana Ka Aana Jana (Round Trip Distance):
                </span>
                <span className="font-mono text-base font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                  {dailyKm} KM
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={120}
                step={1}
                value={dailyKm}
                onChange={(e) => setDailyKm(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>2 KM (Nazdeek)</span>
                <span>30 KM (Normal Office)</span>
                <span>60 KM</span>
                <span>120 KM (Long Commute)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Mahine Mein Safar Ke Din (Travel Days):">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={travelDays}
                    onChange={(e) =>
                      setTravelDays(Math.min(31, Math.max(1, Number(e.target.value))))
                    }
                    className="input-base pl-9"
                  />
                </div>
              </Field>

              <Field label={`Petrol/Fuel Rate (PKR / ${fuelObj.unit}):`}>
                <div className="relative">
                  <Fuel className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="number"
                    min={10}
                    step={0.5}
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Number(e.target.value))}
                    disabled={isPublic}
                    className="input-base pl-9"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Model Specific Mechanic & Ustad Advice */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Wrench className="h-4 w-4" />
              <span>{activeModel.name} — Pakistani Mechanic / Ustad Advice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{activeModel.localAdvice}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs">
              <div className="text-slate-300">
                <span className="text-amber-400 font-bold">Tyre PSI: </span>
                {activeModel.tyrePsi}
              </div>
              <div className="text-slate-300">
                <span className="text-amber-400 font-bold">Engine Oil: </span>
                {activeModel.oilGrade}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Calculated Fuel Burn & Practical Savings ──── */}
        <div className="space-y-6">
          {/* Main Burn Summary Card */}
          <div className="glass-card p-5 sm:p-6 space-y-4 border-emerald-500/30">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                Kharcha Summary ({activeModel.name})
              </h4>
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewPeriod("monthly")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      viewPeriod === "monthly"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Monthly (ماہانہ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPeriod("daily")}
                    className={`rounded-md px-2.5 py-1 transition ${
                      viewPeriod === "daily"
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Daily Burn (روزانہ)
                  </button>
                </div>
                <span className="badge-safe hidden sm:inline">{travelDays} Days/Mo</span>
              </div>
            </div>

            {/* Big Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-xl border p-4 transition ${
                  viewPeriod === "daily"
                    ? "border-amber-500/50 bg-amber-950/20"
                    : "border-slate-800 bg-slate-900/80"
                }`}
              >
                <p className="text-xs text-slate-400 font-medium">Rozana Ka Kharcha (Daily):</p>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  Rs. {Math.round(metrics.dailyCost).toLocaleString("en-PK")}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPublic ? "Public Fare" : `${metrics.dailyLitres.toFixed(1)} Litres/day`}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 transition ${
                  viewPeriod === "monthly"
                    ? "border-emerald-500/50 bg-emerald-950/20"
                    : "border-slate-800 bg-slate-900/80"
                }`}
              >
                <p className="text-xs text-slate-400 font-medium">Mahana Kharcha (Monthly):</p>
                <p className="text-2xl font-black text-white mt-1">
                  Rs. {Math.round(metrics.monthlyCost).toLocaleString("en-PK")}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPublic ? "Fare Total" : `${metrics.monthlyLitres.toFixed(1)} Litres total`}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs text-slate-300">
              <span>
                Mahana Safar: <strong>{metrics.monthlyKm} KM</strong>
              </span>
              <span>
                Saal Ka Kharcha:{" "}
                <strong className="text-amber-400">
                  Rs. {Math.round(metrics.annualCost).toLocaleString("en-PK")}
                </strong>
              </span>
            </div>

            {/* Savings Strategy Selection */}
            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                Bachat Ka Tareeqa Muntakhib Karein (Savings Strategy):
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {STRATEGIES.map((s) => {
                  const active = s.id === selectedStrategy;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStrategy(s.id);
                        setSavedPlan(false);
                      }}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {s.icon}
                        <span>{s.short}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Bar: Current vs Optimized */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Bachat Baad Kharcha:</span>
                  <p className="text-xl font-black text-emerald-400">
                    Rs. {Math.round(metrics.optimizedMonthlyCost).toLocaleString("en-PK")} / Mahana
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-500/40">
                    Bachat: Rs. {Math.round(metrics.monthlySavings).toLocaleString("en-PK")} / mo
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Saal Mein: Rs. {Math.round(metrics.yearlySavings).toLocaleString("en-PK")}{" "}
                    Bachat
                  </p>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Current Outlay (100%)</span>
                  <span>Optimized ({Math.round(100 - metrics.savingsPct)}%)</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(15, 100 - metrics.savingsPct)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Instant WhatsApp & Copy Share Button */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="text-xs font-bold text-slate-300 mb-2">
                📲 Share Fuel Expense Plan (فیملی کے ساتھ واٹس ایپ شیئر کریں):
              </p>
              <ShareReportButton
                title="Commute & Fuel Budget Plan"
                urduTitle="ماہانہ فیول و سفری خرچ رپورٹ"
                category="fuel"
                totalCostLabel={viewPeriod === "daily" ? "Daily Fuel Burn" : "Monthly Fuel Expense"}
                totalCostValue={`Rs. ${Math.round(viewPeriod === "daily" ? metrics.dailyCost : metrics.monthlyCost).toLocaleString("en-PK")}`}
                dailyBurnValue={`Rs. ${Math.round(metrics.dailyCost).toLocaleString("en-PK")} / day`}
                savingsValue={`Rs. ${Math.round(metrics.monthlySavings).toLocaleString("en-PK")} / month`}
                breakdown={[
                  { label: "Vehicle Model", value: activeModel.name },
                  { label: "Mileage (km/L)", value: `${effectiveMileage ?? "N/A"} km/L` },
                  { label: "Daily Route", value: `${dailyKm} km (${travelDays} days/mo)` },
                  {
                    label: "Fuel Rate",
                    value: `${fuelObj.name} @ Rs. ${fuelPrice.toFixed(2)}/${fuelObj.unit}`,
                  },
                  {
                    label: "Optimized Monthly Outlay",
                    value: `Rs. ${Math.round(metrics.optimizedMonthlyCost).toLocaleString("en-PK")}`,
                  },
                ]}
                advice={activeModel.localAdvice}
              />
            </div>

            <button
              type="button"
              onClick={() => setSavedPlan(true)}
              className="btn-primary w-full justify-center text-sm py-3"
            >
              {savedPlan ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Ye Plan Save Ho Gaya Hai
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4" /> Save Monthly Commute Budget Plan
                </>
              )}
            </button>
          </div>

          {/* Golden Rules for Pakistani Commuters */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Pakistani Roads Ke Liye 4 Sunhere Assool
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">1.</span>
                <span>
                  <strong>Hawa Ka Pressure (PSI):</strong> Har hafte petrol pump pe tyre pressure
                  check karwayen. Kam hawa se engine pe bojh barhta hai aur 8% tak petrol zaya hota
                  hai.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">2.</span>
                <span>
                  <strong>Speed Breakers Pe Smooth Chalaen:</strong> Har signal aur jhatke pe
                  achanak accelerator dabane ke bajaye aahista speed barhaen (15% petrol bachta
                  hai).
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">3.</span>
                <span>
                  <strong>Traffic Rush Hour Se Pehle Niklen:</strong> 15 minute pehle nikalne se 1st
                  gear clutch driving aur signal jam se bacha ja sakta hai.
                </span>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <span className="font-bold text-emerald-400">4.</span>
                <span>
                  <strong>Air Filter Ki Safai:</strong> Pakistan ki dhoop aur mitti se filter jaldi
                  choke hota hai. Har 1,500 km baad hawa lagwaen ya saaf karein.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
