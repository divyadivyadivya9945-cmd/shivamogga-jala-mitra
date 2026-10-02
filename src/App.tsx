import { useMemo, useState } from "react";
import "./index.css";

type Tab = "supply" | "grievance" | "bill" | "tanker" | "scada";

type Ward = {
  id: string;
  name: string;
  status: "active" | "scheduled" | "maintenance";
  time: string;
  pressure: string;
  flow: string;
  source: string;
  officer: string;
  x: number;
  y: number;
};

type Complaint = {
  id: string;
  date: string;
  name: string;
  mobile: string;
  ward: string;
  type: string;
  description: string;
  status: "Registered" | "In Progress" | "Resolved";
};

type Payment = {
  id: string;
  date: string;
  consumer: string;
  amount: number;
  method: string;
  status: "Success";
};

type TankerBooking = {
  id: string;
  date: string;
  name: string;
  mobile: string;
  address: string;
  requiredDate: string;
  capacity: string;
  purpose: string;
  status: "Booked" | "Delivered" | "Cancelled";
};

const COMPLAINTS_KEY = "jalaMitraComplaints";
const PAYMENTS_KEY = "jalaMitraPayments";
const TANKERS_KEY = "jalaMitraTankers";

function readSaved<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function saveRecord<T>(key: string, record: T) {
  const records = readSaved<T>(key);
  localStorage.setItem(key, JSON.stringify([record, ...records]));
}

function formatDateTime() {
  return new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const wards: Ward[] = [
  {
    id: "W01",
    name: "Ward 1 - Vinoba Nagar",
    status: "active",
    time: "06:00 AM - 09:30 AM",
    pressure: "3.9 bar",
    flow: "18.4 MLD",
    source: "Tunga River Filtration Bed",
    officer: "Er. Ravi K (AE)",
    x: 18,
    y: 35,
  },
  {
    id: "W04",
    name: "Ward 4 - Gandhi Nagar",
    status: "active",
    time: "07:00 AM - 10:30 AM",
    pressure: "4.1 bar",
    flow: "17.2 MLD",
    source: "Tunga River Filtration Bed",
    officer: "Er. Anil S (AE)",
    x: 36,
    y: 51,
  },
  {
    id: "W12",
    name: "Ward 12 - Durgigudi",
    status: "active",
    time: "08:00 AM - 11:30 AM",
    pressure: "3.7 bar",
    flow: "15.8 MLD",
    source: "Gajanur Reservoir",
    officer: "Er. Meena P (AE)",
    x: 12,
    y: 56,
  },
  {
    id: "W18",
    name: "Ward 18 - Tilak Nagar",
    status: "scheduled",
    time: "02:00 PM - 05:30 PM",
    pressure: "3.4 bar",
    flow: "14.3 MLD",
    source: "Gajanur Reservoir",
    officer: "Er. Kiran M (AE)",
    x: 41,
    y: 30,
  },
  {
    id: "W24",
    name: "Ward 24 - Gopala Extension & Sharavathi Colony",
    status: "scheduled",
    time: "04:00 PM - 07:30 PM",
    pressure: "4.3 bar",
    flow: "16.1 MLD",
    source: "Gopala Ground Level Storage (GLSR)",
    officer: "Er. Divya R (AE)",
    x: 55,
    y: 63,
  },
  {
    id: "W31",
    name: "Ward 31 - NT Road, Hosamane & Railway Feeder",
    status: "active",
    time: "05:00 PM - 08:30 PM",
    pressure: "4.0 bar",
    flow: "17.6 MLD",
    source: "Tunga River Filtration Bed",
    officer: "Er. Shweta N (AE)",
    x: 31,
    y: 75,
  },
];

const statusLabel = {
  active: "Supply Active",
  scheduled: "Scheduled Next",
  maintenance: "Maintenance",
};

type Language = "English" | "ಕನ್ನಡ";

const kn: Record<string, string> = {
  "SHIVAMOGGA JALA MITRA": "ಶಿವಮೊಗ್ಗ ಜಲ ಮಿತ್ರ",
  "Jala Mitra - Smart Water Management & Citizen Redressal": "ಜಲ ಮಿತ್ರ - ಸ್ಮಾರ್ಟ್ ನೀರು ನಿರ್ವಹಣೆ ಮತ್ತು ನಾಗರಿಕ ದೂರು ಪರಿಹಾರ",
  "TUNGA RESERVOIR": "ತುಂಗಾ ಜಲಾಶಯ",
  "WATER QUALITY INDEX": "ನೀರಿನ ಗುಣಮಟ್ಟ ಸೂಚ್ಯಂಕ",
  "Potable": "ಕುಡಿಯಲು ಯೋಗ್ಯ",
  "Supply Timetable & Map": "ನೀರು ಪೂರೈಕೆ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ನಕ್ಷೆ",
  "Grievances & Redressal": "ದೂರುಗಳು ಮತ್ತು ಪರಿಹಾರ",
  "Pay Water Tax / Bill": "ನೀರು ತೆರಿಗೆ / ಬಿಲ್ ಪಾವತಿ",
  "Book Water Tanker": "ನೀರಿನ ಟ್ಯಾಂಕರ್ ಬುಕ್ ಮಾಡಿ",
  "Tunga River & SCADA Telemetry": "ತುಂಗಾ ನದಿ ಮತ್ತು SCADA ಟೆಲಿಮೆಟ್ರಿ",
  "Last updated: Just now • Today": "ಕೊನೆಯ ನವೀಕರಣ: ಈಗಷ್ಟೇ • ಇಂದು",
  "Citizen-first smart water management portal": "ನಾಗರಿಕರಿಗೆ ಆದ್ಯತೆ ನೀಡುವ ಸ್ಮಾರ್ಟ್ ನೀರು ನಿರ್ವಹಣಾ ಪೋರ್ಟಲ್",
  "SMART WATER NETWORK • 24×7 MONITORING": "ಸ್ಮಾರ್ಟ್ ನೀರು ಜಾಲ • 24×7 ಮೇಲ್ವಿಚಾರಣೆ",
  "Water Supply Timetable & Distribution Network": "ನೀರು ಪೂರೈಕೆ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ವಿತರಣಾ ಜಾಲ",
  "Check rotational supply slots, pressure, and maintenance status for Shivamogga Corporation wards.": "ಶಿವಮೊಗ್ಗ ಮಹಾನಗರ ಪಾಲಿಕೆಯ ವಾರ್ಡ್‌ಗಳ ಪೂರೈಕೆ ಸಮಯ, ಒತ್ತಡ ಮತ್ತು ನಿರ್ವಹಣೆ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
  "Search ward...": "ವಾರ್ಡ್ ಹುಡುಕಿ...",
  "✦ SHIVAMOGGA GIS GRID": "✦ ಶಿವಮೊಗ್ಗ GIS ಗ್ರಿಡ್",
  "Distribution Network Nodes": "ವಿತರಣಾ ಜಾಲದ ನೋಡ್‌ಗಳು",
  "Click any ward cluster node on the river feeder mesh to inspect.": "ವಿವರಗಳನ್ನು ನೋಡಲು ನದಿ ಫೀಡರ್ ಜಾಲದಲ್ಲಿರುವ ಯಾವುದೇ ವಾರ್ಡ್ ನೋಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
  "Live Telemetry": "ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ",
  "Tunga River (550 km)": "ತುಂಗಾ ನದಿ (550 ಕಿಮೀ)",
  "Ward 1 - Vinoba Nagar": "ವಾರ್ಡ್ 1 - ವಿನೋಬಾ ನಗರ",
  "Ward 4 - Gandhi Nagar": "ವಾರ್ಡ್ 4 - ಗಾಂಧಿ ನಗರ",
  "Ward 12 - Durgigudi": "ವಾರ್ಡ್ 12 - ದುರ್ಗಿಗುಡಿ",
  "Ward 18 - Tilak Nagar": "ವಾರ್ಡ್ 18 - ತಿಲಕ್ ನಗರ",
  "Ward 24 - Gopala Extension & Sharavathi Colony": "ವಾರ್ಡ್ 24 - ಗೋಪಾಲ ಎಕ್ಸ್‌ಟೆನ್ಶನ್ ಮತ್ತು ಶರಾವತಿ ಕಾಲೋನಿ",
  "Ward 31 - NT Road, Hosamane & Railway Feeder": "ವಾರ್ಡ್ 31 - ಎನ್‌ಟಿ ರಸ್ತೆ, ಹೊಸಮನೆ ಮತ್ತು ರೈಲ್ವೇ ಫೀಡರ್",
  "Tunga River Filtration Bed": "ತುಂಗಾ ನದಿ ಶೋಧನಾ ಘಟಕ",
  "Gajanur Reservoir": "ಗಾಜನೂರು ಜಲಾಶಯ",
  "Gopala Ground Level Storage (GLSR)": "ಗೋಪಾಲ ಗ್ರೌಂಡ್ ಲೆವೆಲ್ ಸ್ಟೋರೇಜ್ (GLSR)",
  "Intake Weir": "ಇಂಟೇಕ್ ವಿಯರ್",
  "Active": "ಸಕ್ರಿಯ",
  "Supply Active": "ನೀರು ಪೂರೈಕೆ ಸಕ್ರಿಯ",
  "Scheduled Next": "ಮುಂದಿನ ನಿಗದಿತ ಪೂರೈಕೆ",
  "Scheduled": "ನಿಗದಿತ",
  "Maintenance": "ನಿರ್ವಹಣೆ",
  "SELECTED WARD": "ಆಯ್ಕೆ ಮಾಡಿದ ವಾರ್ಡ್",
  "PRESSURE": "ಒತ್ತಡ",
  "FLOW RATE": "ಹರಿವು ದರ",
  "SOURCE": "ಮೂಲ",
  "Ward Supply Status": "ವಾರ್ಡ್ ನೀರು ಪೂರೈಕೆ ಸ್ಥಿತಿ",
  "Today": "ಇಂದು",
  "No ward found. Try W01, W04, W12, W18, W24 or W31.": "ವಾರ್ಡ್ ಕಂಡುಬಂದಿಲ್ಲ. W01, W04, W12, W18, W24 ಅಥವಾ W31 ಪ್ರಯತ್ನಿಸಿ.",
  "CITIZEN SERVICES": "ನಾಗರಿಕ ಸೇವೆಗಳು",
  "Quick Actions": "ತ್ವರಿತ ಸೇವೆಗಳು",
  "Report Water Issue": "ನೀರಿನ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
  "Register a complaint": "ದೂರು ನೋಂದಾಯಿಸಿ",
  "Pay Water Bill": "ನೀರಿನ ಬಿಲ್ ಪಾವತಿಸಿ",
  "View & pay your bill": "ಬಿಲ್ ನೋಡಿ ಮತ್ತು ಪಾವತಿಸಿ",
  "Request emergency supply": "ತುರ್ತು ನೀರು ಪೂರೈಕೆ ಕೇಳಿ",
  "Live SCADA": "ಲೈವ್ SCADA",
  "View telemetry dashboard": "ಟೆಲಿಮೆಟ್ರಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನೋಡಿ",
  "WATER CONSERVATION": "ನೀರು ಸಂರಕ್ಷಣೆ",
  "Every Drop Counts": "ಪ್ರತಿ ಹನಿಯೂ ಅಮೂಲ್ಯ",
  "Use water responsibly and help Shivamogga conserve its water resources.": "ನೀರನ್ನು ಜವಾಬ್ದಾರಿಯಿಂದ ಬಳಸಿ ಮತ್ತು ಶಿವಮೊಗ್ಗದ ನೀರಿನ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಸಂರಕ್ಷಿಸಲು ಸಹಕರಿಸಿ.",
  "📢 LATEST NOTICE": "📢 ಇತ್ತೀಚಿನ ಸೂಚನೆ",
  "Ward 24 evening supply": "ವಾರ್ಡ್ 24 ಸಂಜೆ ನೀರು ಪೂರೈಕೆ",
  "Supply is scheduled from": "ಪೂರೈಕೆ ಸಮಯ:",
  "Cycle status:": "ಚಕ್ರ ಸ್ಥಿತಿ:",
  "Supply running now": "ಈಗ ಪೂರೈಕೆ ನಡೆಯುತ್ತಿದೆ",
  "Today in scheduled cycle": "ಇಂದಿನ ನಿಗದಿತ ಚಕ್ರದಲ್ಲಿ",
  "Report Ward Issue ›": "ವಾರ್ಡ್ ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ ›",
  "TIMETABLE": "ವೇಳಾಪಟ್ಟಿ",
  "Current batch": "ಪ್ರಸ್ತುತ ಬ್ಯಾಚ್",
  "Evening batch": "ಸಂಜೆ ಬ್ಯಾಚ್",
  "Normal": "ಸಾಮಾನ್ಯ",
  "Current flow": "ಪ್ರಸ್ತುತ ಹರಿವು",
  "WARD IN-CHARGE": "ವಾರ್ಡ್ ಉಸ್ತುವಾರಿ",
  "Assistant Engineer": "ಸಹಾಯಕ ಇಂಜಿನಿಯರ್",
  "CITIZEN REDRESSAL": "ನಾಗರಿಕ ದೂರು ಪರಿಹಾರ",
  
  "Register complaints and keep a complete local history of submitted water issues.": "ನೀರಿನ ಸಮಸ್ಯೆಗಳ ದೂರುಗಳನ್ನು ನೋಂದಾಯಿಸಿ ಮತ್ತು ಅವುಗಳ ಸಂಪೂರ್ಣ ಸ್ಥಳೀಯ ಇತಿಹಾಸವನ್ನು ಉಳಿಸಿ.",
  "Register a Complaint": "ದೂರು ನೋಂದಾಯಿಸಿ",
  "Name": "ಹೆಸರು",
  "Enter your name": "ನಿಮ್ಮ ಹೆಸರು ನಮೂದಿಸಿ",
  "Mobile Number": "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
  "10-digit mobile number": "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
  "Ward": "ವಾರ್ಡ್",
  "Issue Type": "ಸಮಸ್ಯೆಯ ವಿಧ",
  "No water supply": "ನೀರು ಪೂರೈಕೆ ಇಲ್ಲ",
  "Low pressure": "ಕಡಿಮೆ ಒತ್ತಡ",
  "Pipeline leakage": "ಪೈಪ್‌ಲೈನ್ ಸೋರಿಕೆ",
  "Water quality": "ನೀರಿನ ಗುಣಮಟ್ಟ",
  "Other": "ಇತರೆ",
  "Description": "ವಿವರಣೆ",
  "Describe the issue...": "ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ...",
  "Submit Complaint": "ದೂರು ಸಲ್ಲಿಸಿ",
  "Complaint tracking": "ದೂರು ಟ್ರ್ಯಾಕಿಂಗ್",
  "Your submitted complaints are saved in this browser so you can review them later on this device.": "ನೀವು ಸಲ್ಲಿಸಿದ ದೂರುಗಳನ್ನು ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ; ಇದೇ ಸಾಧನದಲ್ಲಿ ನಂತರ ನೋಡಬಹುದು.",
  "Saved complaints": "ಉಳಿಸಿದ ದೂರುಗಳು",
  "Open complaints": "ಬಾಕಿ ಇರುವ ದೂರುಗಳು",
  "Response target": "ಪ್ರತಿಕ್ರಿಯೆ ಗುರಿ",
  "Within 24 hours": "24 ಗಂಟೆಗಳೊಳಗೆ",
  "My Complaint History": "ನನ್ನ ದೂರು ಇತಿಹಾಸ",
  "No complaints have been registered yet.": "ಇನ್ನೂ ಯಾವುದೇ ದೂರು ನೋಂದಾಯಿಸಲಾಗಿಲ್ಲ.",
  "Clear History": "ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಿ",
  "SAVED LOCALLY": "ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ",
  "Data is stored in this browser using localStorage. It remains after refreshing the page, but it does not automatically transfer to another laptop or browser.": "ಡೇಟಾವನ್ನು ಈ ಬ್ರೌಸರ್‌ನ localStorage ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ. ಪುಟ ರಿಫ್ರೆಶ್ ಮಾಡಿದರೂ ಉಳಿಯುತ್ತದೆ, ಆದರೆ ಬೇರೆ ಲ್ಯಾಪ್‌ಟಾಪ್ ಅಥವಾ ಬ್ರೌಸರ್‌ಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ವರ್ಗಾವಣೆಯಾಗುವುದಿಲ್ಲ.",
  "ONLINE PAYMENT": "ಆನ್‌ಲೈನ್ ಪಾವತಿ",
  "Search your water connection, pay the bill, and keep your payment history.": "ನಿಮ್ಮ ನೀರಿನ ಸಂಪರ್ಕ ಹುಡುಕಿ, ಬಿಲ್ ಪಾವತಿಸಿ ಮತ್ತು ಪಾವತಿ ಇತಿಹಾಸ ಉಳಿಸಿ.",
  "Enter Connection / Consumer Number": "ಸಂಪರ್ಕ / ಗ್ರಾಹಕ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
  "Search Bill": "ಬಿಲ್ ಹುಡುಕಿ",
  "CONSUMER NUMBER": "ಗ್ರಾಹಕ ಸಂಖ್ಯೆ",
  "Shivamogga Municipal Water Connection": "ಶಿವಮೊಗ್ಗ ಮಹಾನಗರ ಪಾಲಿಕೆ ನೀರಿನ ಸಂಪರ್ಕ",
  "AMOUNT DUE": "ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ",
  "Due this month": "ಈ ತಿಂಗಳ ಬಾಕಿ",
  "Pay Now": "ಈಗ ಪಾವತಿಸಿ",
  "Payment successful. Receipt:": "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ. ರಸೀದಿ:",
  "Payment History": "ಪಾವತಿ ಇತಿಹಾಸ",
  "No payments have been completed yet.": "ಇನ್ನೂ ಯಾವುದೇ ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ.",
  "Water Bill Payment": "ನೀರಿನ ಬಿಲ್ ಪಾವತಿ",
  "Consumer:": "ಗ್ರಾಹಕ:",
  "Payment mode:": "ಪಾವತಿ ವಿಧಾನ:",
  "Success": "ಯಶಸ್ವಿ",
  "EMERGENCY WATER SERVICE": "ತುರ್ತು ನೀರು ಸೇವೆ",
  "Request a tanker and keep complete booking details for follow-up.": "ಟ್ಯಾಂಕರ್ ಕೋರಿಕೆ ಸಲ್ಲಿಸಿ ಮತ್ತು ಅನುಸರಣೆಗಾಗಿ ಸಂಪೂರ್ಣ ಬುಕ್ಕಿಂಗ್ ವಿವರಗಳನ್ನು ಉಳಿಸಿ.",
  "Tanker Request": "ಟ್ಯಾಂಕರ್ ಕೋರಿಕೆ",
  "Delivery Address": "ವಿತರಣೆ ವಿಳಾಸ",
  "Required Date": "ಅಗತ್ಯ ದಿನಾಂಕ",
  "Tanker Capacity": "ಟ್ಯಾಂಕರ್ ಸಾಮರ್ಥ್ಯ",
  "Purpose": "ಉದ್ದೇಶ",
  "Household emergency": "ಮನೆಯ ತುರ್ತು ಅಗತ್ಯ",
  "Apartment / Community": "ಅಪಾರ್ಟ್‌ಮೆಂಟ್ / ಸಮುದಾಯ",
  "Hospital / Institution": "ಆಸ್ಪತ್ರೆ / ಸಂಸ್ಥೆ",
  "Book Tanker": "ಟ್ಯಾಂಕರ್ ಬುಕ್ ಮಾಡಿ",
  "Water tanker service": "ನೀರಿನ ಟ್ಯಾಂಕರ್ ಸೇವೆ",
  "All submitted tanker requests are stored in this browser with the complete delivery details.": "ಸಲ್ಲಿಸಿದ ಎಲ್ಲಾ ಟ್ಯಾಂಕರ್ ಕೋರಿಕೆಗಳನ್ನು ಸಂಪೂರ್ಣ ವಿತರಣೆ ವಿವರಗಳೊಂದಿಗೆ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ.",
  "Saved bookings": "ಉಳಿಸಿದ ಬುಕ್ಕಿಂಗ್‌ಗಳು",
  "Typical capacity": "ಸಾಮಾನ್ಯ ಸಾಮರ್ಥ್ಯ",
  "Service areas": "ಸೇವಾ ಪ್ರದೇಶಗಳು",
  "Corporation wards": "ಮಹಾನಗರ ಪಾಲಿಕೆ ವಾರ್ಡ್‌ಗಳು",
  "Water Tanker Booking History": "ನೀರಿನ ಟ್ಯಾಂಕರ್ ಬುಕ್ಕಿಂಗ್ ಇತಿಹಾಸ",
  "No tanker bookings have been made yet.": "ಇನ್ನೂ ಯಾವುದೇ ಟ್ಯಾಂಕರ್ ಬುಕ್ಕಿಂಗ್ ಮಾಡಲಾಗಿಲ್ಲ.",
  "Booked": "ಬುಕ್ ಮಾಡಲಾಗಿದೆ",
  "Booked by": "ಬುಕ್ ಮಾಡಿದವರು",
  "Delivery:": "ವಿತರಣೆ:",
  "Required:": "ಅಗತ್ಯ:",
  "Mobile:": "ಮೊಬೈಲ್:",
  "LIVE TELEMETRY": "ಲೈವ್ ಟೆಲಿಮೆಟ್ರಿ",
  "Operational overview of reservoir, treatment, pressure and distribution telemetry.": "ಜಲಾಶಯ, ನೀರು ಶುದ್ಧೀಕರಣ, ಒತ್ತಡ ಮತ್ತು ವಿತರಣಾ ಟೆಲಿಮೆಟ್ರಿಯ ಕಾರ್ಯಾಚರಣಾ ಅವಲೋಕನ.",
  "SCADA SYSTEM ONLINE": "SCADA ಸಿಸ್ಟಮ್ ಆನ್‌ಲೈನ್",
  "All primary telemetry channels connected": "ಎಲ್ಲಾ ಮುಖ್ಯ ಟೆಲಿಮೆಟ್ರಿ ಚಾನೆಲ್‌ಗಳು ಸಂಪರ್ಕಗೊಂಡಿವೆ",
  "Reservoir Level": "ಜಲಾಶಯ ಮಟ್ಟ",
  "Inflow": "ಒಳಹರಿವು",
  "Network Pressure": "ಜಾಲದ ಒತ್ತಡ",
  "Potable range": "ಕುಡಿಯಲು ಯೋಗ್ಯ ವ್ಯಾಪ್ತಿ",
  "Telemetry window:": "ಟೆಲಿಮೆಟ್ರಿ ಅವಧಿ:",
  "Reservoir Level Trend": "ಜಲಾಶಯ ಮಟ್ಟದ ಪ್ರವೃತ್ತಿ",
  "WATER TREATMENT PLANT": "ನೀರು ಶುದ್ಧೀಕರಣ ಘಟಕ",
  "Treatment Stages": "ಶುದ್ಧೀಕರಣ ಹಂತಗಳು",
  "Raw Water": "ಕಚ್ಚಾ ನೀರು",
  "Coagulation": "ಘನೀಕರಣ",
  "Filtration": "ಶೋಧನೆ",
  "Disinfection": "ಸೋಂಕು ನಿವಾರಣೆ",
  "Clear Water": "ಶುದ್ಧ ನೀರು",
};

function tr(text: string, language: Language) {
  return language === "ಕನ್ನಡ" ? (kn[text] ?? text) : text;
}

function App() {
  const [tab, setTab] = useState<Tab>("supply");
  const [selectedWard, setSelectedWard] = useState("W24");
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [notice, setNotice] = useState("System online • SCADA telemetry connected");

  const selected = wards.find((ward) => ward.id === selectedWard) ?? wards[0];

  const filteredWards = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return wards;

    return wards.filter(
      (ward) =>
        ward.id.toLowerCase().includes(query) ||
        ward.name.toLowerCase().includes(query)
    );
  }, [search]);

  const navigate = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <span>≈</span>
            <span>≈</span>
            <span>≈</span>
          </div>

          <div className="brand-copy">
            <div className="brand-title-row">
              <h1>{tr("SHIVAMOGGA JALA MITRA", language)}</h1>
              <span className="agency-badge">SMC KUWS&DB</span>
            </div>
            <p>{tr("Jala Mitra - Smart Water Management & Citizen Redressal", language)}</p>
          </div>
        </div>

        <div className="header-metrics">
          <div className="header-metric">
            <span>{tr("TUNGA RESERVOIR", language)}</span>
            <strong><i /> 588.42 m <small>(94.1%)</small></strong>
          </div>

          <div className="header-metric">
            <span>{tr("WATER QUALITY INDEX", language)}</span>
            <strong className="quality-value">♧ {tr("Potable", language)} <small>(TDS 112 ppm)</small></strong>
          </div>

          <button
            className="language-button"
            onClick={() =>
              setLanguage(language === "English" ? "ಕನ್ನಡ" : "English")
            }
          >
            {language}
          </button>
        </div>
      </header>

      <nav className="main-nav">
        <NavButton
          active={tab === "supply"}
          onClick={() => navigate("supply")}
          icon="▣"
          text={tr("Supply Timetable & Map", language)}
        />
        <NavButton
          active={tab === "grievance"}
          onClick={() => navigate("grievance")}
          icon="△"
          text={tr("Grievances & Redressal", language)}
          badge="4"
        />
        <NavButton
          active={tab === "bill"}
          onClick={() => navigate("bill")}
          icon="▤"
          text={tr("Pay Water Tax / Bill", language)}
        />
        <NavButton
          active={tab === "tanker"}
          onClick={() => navigate("tanker")}
          icon="▱"
          text={tr("Book Water Tanker", language)}
        />
        <NavButton
          active={tab === "scada"}
          onClick={() => navigate("scada")}
          icon="⌁"
          text={tr("Tunga River & SCADA Telemetry", language)}
        />
      </nav>

      <div className="system-line">
        <span><i className="online-dot" /> {notice}</span>
        <span>{tr("Last updated: Just now • Today", language)}</span>
      </div>

      <main>
        {tab === "supply" && (
          <SupplySection
            language={language}
            search={search}
            setSearch={setSearch}
            selected={selected}
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
            filteredWards={filteredWards}
            navigate={navigate}
          />
        )}

        {tab === "grievance" && <GrievanceSection language={language} setNotice={setNotice} />}
        {tab === "bill" && <BillSection language={language} setNotice={setNotice} />}
        {tab === "tanker" && <TankerSection language={language} setNotice={setNotice} />}
        {tab === "scada" && <ScadaSection language={language} />}
      </main>

      <footer>
        <div>
          <b>{tr("SHIVAMOGGA JALA MITRA", language)}</b>
          <span>{tr("Citizen-first smart water management portal", language)}</span>
        </div>
        <span>SMC • KUWS&amp;DB • Shivamogga</span>
      </footer>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  text,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  text: string;
  badge?: string;
}) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      {text}
      {badge && <b className="nav-badge">{badge}</b>}
    </button>
  );
}

function SupplySection({
  language,
  search,
  setSearch,
  selected,
  selectedWard,
  setSelectedWard,
  filteredWards,
  navigate,
}: {
  language: Language;
  search: string;
  setSearch: (value: string) => void;
  selected: Ward;
  selectedWard: string;
  setSelectedWard: (value: string) => void;
  filteredWards: Ward[];
  navigate: (tab: Tab) => void;
}) {
  return (
    <>
      <section className="intro-card">
        <div>
          <span className="eyebrow">{tr("SMART WATER NETWORK • 24×7 MONITORING", language)}</span>
          <h2>{tr("Water Supply Timetable & Distribution Network", language)}</h2>
          <p>
            {tr("Check rotational supply slots, pressure, and maintenance status for Shivamogga Corporation wards.", language)}
          </p>
        </div>

        <label className="ward-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr("Search ward...", language)}
          />
        </label>
      </section>

      <section className="network-layout">
        <div className="map-panel">
          <div className="map-panel-header">
            <div>
              <span className="map-kicker">{tr("✦ SHIVAMOGGA GIS GRID", language)}</span>
              <h3>{tr("Distribution Network Nodes", language)}</h3>
              <p>{tr("Click any ward cluster node on the river feeder mesh to inspect.", language)}</p>
            </div>
            <span className="telemetry-tag">
              <i className="online-dot" /> {tr("Live Telemetry", language)}
            </span>
          </div>

          <div className="gis-map">
            <div className="gis-grid" />
            <div className="gis-road road-a" />
            <div className="gis-road road-b" />
            <div className="gis-road road-c" />

            <div className="river-shape river-main" />
            <div className="river-shape river-secondary" />

            <div className="feeder feeder-a" />
            <div className="feeder feeder-b" />
            <div className="feeder feeder-c" />

            <div className="water-flow flow-1"><i /><i /><i /></div>
            <div className="water-flow flow-2"><i /><i /><i /></div>
            <div className="water-flow flow-3"><i /><i /><i /></div>
            <div className="water-flow flow-4"><i /><i /><i /></div>

            <span className="river-name">{tr("Tunga River (550 km)", language)}</span>

            <button
              className="intake-marker"
              onClick={() => alert(tr("Tunga Intake Weir • Telemetry online", language))}
            >
              <span>◆</span>
              {tr("Intake Weir", language)}
            </button>

            {wards.map((ward) => (
              <button
                key={ward.id}
                className={`ward-node ${ward.status} ${
                  selectedWard === ward.id ? "selected" : ""
                }`}
                style={{ left: `${ward.x}%`, top: `${ward.y}%` }}
                onClick={() => setSelectedWard(ward.id)}
              >
                <strong>{ward.id}</strong>
                <i />
              </button>
            ))}

            <div className="map-legend">
              <span><i className="legend-dot active" /> {tr("Active", language)}</span>
              <span><i className="legend-dot scheduled" /> {tr("Scheduled", language)}</span>
              <span><i className="legend-dot maintenance" /> {tr("Maintenance", language)}</span>
            </div>

            <div className="map-tools">
              <button title={tr("Zoom in", language)} onClick={() => alert(tr("Zoom in", language))}>+</button>
              <button title={tr("Zoom out", language)} onClick={() => alert(tr("Zoom out", language))}>−</button>
              <button title={tr("Reset", language)} onClick={() => setSelectedWard("W24")}>⟳</button>
            </div>
          </div>

          <div className="selected-info">
            <div>
              <span>{tr("SELECTED WARD", language)}</span>
              <b>{selected.id} • {tr(selected.name, language).replace(/^[^\-]+- /, "")}</b>
            </div>
            <div>
              <span>{tr("PRESSURE", language)}</span>
              <b>{selected.pressure}</b>
            </div>
            <div>
              <span>{tr("FLOW RATE", language)}</span>
              <b>{selected.flow}</b>
            </div>
            <div>
              <span>{tr("SOURCE", language)}</span>
              <b>{selected.source}</b>
            </div>
          </div>
        </div>

        <div className="ward-area">
          <div className="ward-area-title">
            <h3>{tr("Ward Supply Status", language)}</h3>
            <span>{tr("Today", language)}</span>
          </div>

          {filteredWards.map((ward) => (
            <WardCard
              language={language}
              key={ward.id}
              ward={ward}
              selected={selectedWard === ward.id}
              onSelect={() => setSelectedWard(ward.id)}
              navigate={navigate}
            />
          ))}

          {filteredWards.length === 0 && (
            <div className="empty-result">
              {tr("No ward found. Try W01, W04, W12, W18, W24 or W31.", language)}
            </div>
          )}
        </div>
      </section>

      <section className="services-section">
        <div className="services-title">
          <span className="eyebrow">{tr("CITIZEN SERVICES", language)}</span>
          <h3>{tr("Quick Actions", language)}</h3>
        </div>

        <div className="service-row">
          <ServiceButton
            icon="!"
            title={tr("Report Water Issue", language)}
            text={tr("Register a complaint", language)}
            onClick={() => navigate("grievance")}
          />
          <ServiceButton
            icon="₹"
            title={tr("Pay Water Bill", language)}
            text={tr("View & pay your bill", language)}
            onClick={() => navigate("bill")}
          />
          <ServiceButton
            icon="◆"
            title={tr("Book Water Tanker", language)}
            text={tr("Request emergency supply", language)}
            onClick={() => navigate("tanker")}
          />
          <ServiceButton
            icon="⌁"
            title={tr("Live SCADA", language)}
            text={tr("View telemetry dashboard", language)}
            onClick={() => navigate("scada")}
          />
        </div>
      </section>

      <section className="bottom-notices">
        <div className="conservation-banner">
          <div className="drop-icon">💧</div>
          <div>
            <span className="eyebrow">{tr("WATER CONSERVATION", language)}</span>
            <h3>{tr("Every Drop Counts", language)}</h3>
            <p>{tr("Use water responsibly and help Shivamogga conserve its water resources.", language)}</p>
          </div>
        </div>

        <div className="notice-card">
          <div className="notice-label">{tr("📢 LATEST NOTICE", language)}</div>
          <h3>{tr("Ward 24 evening supply", language)}</h3>
          <p>
            {tr("Supply is scheduled from", language)} <b>04:00 PM - 07:30 PM</b>.
          </p>
        </div>
      </section>
    </>
  );
}

function WardCard({
  language,
  ward,
  selected,
  onSelect,
  navigate,
}: {
  language: Language;
  ward: Ward;
  selected: boolean;
  onSelect: () => void;
  navigate: (tab: Tab) => void;
}) {
  return (
    <article
      className={`ward-card ${selected ? "selected-ward" : ""}`}
      onClick={onSelect}
    >
      <div className="ward-card-top">
        <div className="ward-title">
          <span className="ward-code">{ward.id}</span>
          <div>
            <h3>{tr(ward.name, language)}</h3>
            <p>⌖ {tr("SOURCE", language)}: {tr(ward.source, language)}</p>
          </div>
        </div>

        <span className={`supply-status ${ward.status}`}>
          <i /> {tr(statusLabel[ward.status], language)}
        </span>
      </div>

      <div className="ward-details">
        <WardDetail
          label={tr("TIMETABLE", language)}
          value={ward.time}
          note={tr(ward.status === "active" ? "Current batch" : "Evening batch", language)}
        />
        <WardDetail label={tr("PRESSURE", language)} value={ward.pressure} note={tr("Normal", language)} green />
        <WardDetail label={tr("FLOW RATE", language)} value={ward.flow} note={tr("Current flow", language)} />
        <WardDetail label={tr("WARD IN-CHARGE", language)} value={ward.officer} note={tr("Assistant Engineer", language)} />
      </div>

      <div className="ward-card-bottom">
        <span>
          {tr("Cycle status:", language)}{" "}
          <b>
            {ward.status === "active"
              ? tr("Supply running now", language)
              : tr("Today in scheduled cycle", language)}
          </b>
        </span>

        <button
          onClick={(event) => {
            event.stopPropagation();
            navigate("grievance");
          }}
        >
          {tr("Report Ward Issue ›", language)}
        </button>
      </div>
    </article>
  );
}

function WardDetail({
  label,
  value,
  note,
  green = false,
}: {
  label: string;
  value: string;
  note: string;
  green?: boolean;
}) {
  return (
    <div className="ward-detail">
      <span>{label}</span>
      <b className={green ? "green-value" : ""}>{value}</b>
      <small>{note}</small>
    </div>
  );
}

function ServiceButton({
  icon,
  title,
  text,
  onClick,
}: {
  icon: string;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button className="service-button" onClick={onClick}>
      <span className="service-icon">{icon}</span>
      <span className="service-copy">
        <b>{title}</b>
        <small>{text}</small>
      </span>
      <strong>›</strong>
    </button>
  );
}

function PageTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </section>
  );
}

function GrievanceSection({ language, setNotice }: { language: Language; setNotice: (text: string) => void }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    ward: "W24",
    type: "No water supply",
    description: "",
  });
  const [result, setResult] = useState("");
  const [records, setRecords] = useState<Complaint[]>(() => readSaved<Complaint>(COMPLAINTS_KEY));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !/^\d{10}$/.test(form.mobile) || !form.description.trim()) {
      setResult("Please enter name, valid 10-digit mobile number and complaint details.");
      return;
    }

    const id = `SMC-WTR-${Math.floor(1000 + Math.random() * 9000)}`;
    const complaint: Complaint = {
      id,
      date: formatDateTime(),
      name: form.name,
      mobile: form.mobile,
      ward: form.ward,
      type: form.type,
      description: form.description,
      status: "Registered",
    };

    saveRecord(COMPLAINTS_KEY, complaint);
    setRecords((current) => [complaint, ...current]);
    setResult(`Complaint ${id} registered successfully.`);
    setNotice(`Complaint ${id} submitted • Status: Registered`);
    setForm({ ...form, description: "" });
  };

  const clearRecords = () => {
    localStorage.removeItem(COMPLAINTS_KEY);
    setRecords([]);
  };

  return (
    <div className="page-wrap">
      <PageTitle
        eyebrow={tr("CITIZEN REDRESSAL", language)}
        title={tr("Grievances & Redressal", language)}
        text={tr("Register complaints and keep a complete local history of submitted water issues.", language)}
      />

      <div className="two-column">
        <form className="form-card" onSubmit={submit}>
          <h3>{tr("Register a Complaint", language)}</h3>

          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={tr("Enter your name", language)} />
          </label>

          <label>
            Mobile Number
            <input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder={tr("10-digit mobile number", language)}
            />
          </label>

          <label>
            Ward
            <select value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })}>
              {wards.map((ward) => <option key={ward.id}>{ward.id}</option>)}
            </select>
          </label>

          <label>
            Issue Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option>{tr("No water supply", language)}</option>
              <option>{tr("Low pressure", language)}</option>
              <option>{tr("Pipeline leakage", language)}</option>
              <option>{tr("Water quality", language)}</option>
              <option>{tr("Other", language)}</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={tr("Describe the issue...", language)}
            />
          </label>

          <button className="primary-button">{tr("Submit Complaint", language)}</button>
          {result && <div className="success-box">{result}</div>}
        </form>

        <div className="dark-info-card">
          <span className="large-symbol">!</span>
          <h3>{tr("Complaint tracking", language)}</h3>
          <p>{tr("Your submitted complaints are saved in this browser so you can review them later on this device.", language)}</p>
          <InfoLine label={tr("Saved complaints", language)} value={`${records.length}`} />
          <InfoLine label={tr("Open complaints", language)} value={`${records.filter((r) => r.status !== "Resolved").length}`} />
          <InfoLine label={tr("Response target", language)} value={tr("Within 24 hours", language)} />
        </div>
      </div>

      <RecordPanel
        language={language}
        title={tr("My Complaint History", language)}
        count={records.length}
        onClear={clearRecords}
        empty={tr("No complaints have been registered yet.", language)}
      >
        {records.map((record) => (
          <div className="record-card" key={record.id}>
            <div className="record-main">
              <div className="record-id">{record.id}</div>
              <h4>{record.type} • {record.ward}</h4>
              <p>{record.description}</p>
              <small>{record.name} • {record.mobile} • {record.date}</small>
            </div>
            <span className={`record-status ${record.status.toLowerCase().replace(" ", "-")}`}>{tr(record.status, language)}</span>
          </div>
        ))}
      </RecordPanel>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-line">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function BillSection({ language, setNotice }: { language: Language; setNotice: (text: string) => void }) {
  const [number, setNumber] = useState("");
  const [showBill, setShowBill] = useState(false);
  const [paid, setPaid] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [payments, setPayments] = useState<Payment[]>(() => readSaved<Payment>(PAYMENTS_KEY));

  const searchBill = () => {
    if (number.trim()) setShowBill(true);
  };

  const pay = () => {
    const id = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment: Payment = {
      id,
      date: formatDateTime(),
      consumer: number,
      amount: 1280,
      method: "Online",
      status: "Success",
    };

    saveRecord(PAYMENTS_KEY, payment);
    setPayments((current) => [payment, ...current]);
    setReceipt(id);
    setPaid(true);
    setNotice(`Water bill payment completed • Receipt ${id}`);
  };

  const clearPayments = () => {
    localStorage.removeItem(PAYMENTS_KEY);
    setPayments([]);
  };

  return (
    <div className="page-wrap">
      <PageTitle
        eyebrow={tr("ONLINE PAYMENT", language)}
        title={tr("Pay Water Tax / Bill", language)}
        text={tr("Search your water connection, pay the bill, and keep your payment history.", language)}
      />

      <div className="bill-search">
        <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder={tr("Enter Connection / Consumer Number", language)} />
        <button className="primary-button" onClick={searchBill}>{tr("Search Bill", language)}</button>
      </div>

      {showBill && (
        <div className="bill-card">
          <div className="bill-main">
            <span>{tr("CONSUMER NUMBER", language)}</span>
            <h3>{number}</h3>
            <p>{tr("Shivamogga Municipal Water Connection", language)}</p>
          </div>
          <div className="bill-amount">
            <span>{tr("AMOUNT DUE", language)}</span>
            <strong>₹1,280</strong>
            <small>{tr("Due this month", language)}</small>
          </div>
          <button className="primary-button" onClick={pay}>{paid ? `✓ ${tr("Success", language)}` : tr("Pay Now", language)}</button>
          {paid && <div className="success-box">{tr("Payment successful. Receipt:", language)} {receipt}</div>}
        </div>
      )}

      <RecordPanel
        language={language}
        title={tr("Payment History", language)}
        count={payments.length}
        onClear={clearPayments}
        empty={tr("No payments have been completed yet.", language)}
      >
        {payments.map((payment) => (
          <div className="record-card" key={payment.id}>
            <div className="record-main">
              <div className="record-id">{payment.id}</div>
              <h4>{tr("Water Bill Payment", language)} • ₹{payment.amount.toLocaleString("en-IN")}</h4>
              <p>{tr("Consumer:", language)} {payment.consumer} • {tr("Payment mode:", language)} {payment.method}</p>
              <small>{payment.date}</small>
            </div>
            <span className="record-status success">{tr("Success", language)}</span>
          </div>
        ))}
      </RecordPanel>
    </div>
  );
}

function TankerSection({ language, setNotice }: { language: Language; setNotice: (text: string) => void }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    date: "",
    capacity: "5,000 Litres",
    purpose: "Household emergency",
  });
  const [result, setResult] = useState("");
  const [records, setRecords] = useState<TankerBooking[]>(() => readSaved<TankerBooking>(TANKERS_KEY));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !/^\d{10}$/.test(form.mobile) || !form.address || !form.date) {
      setResult("Please fill all fields with a valid 10-digit mobile number.");
      return;
    }

    const id = `TANK-${Math.floor(10000 + Math.random() * 90000)}`;
    const booking: TankerBooking = {
      id,
      date: formatDateTime(),
      name: form.name,
      mobile: form.mobile,
      address: form.address,
      requiredDate: form.date,
      capacity: form.capacity,
      purpose: form.purpose,
      status: "Booked",
    };

    saveRecord(TANKERS_KEY, booking);
    setRecords((current) => [booking, ...current]);
    setResult(`Booking ${id} confirmed for ${form.date}.`);
    setNotice(`Tanker ${id} booked successfully`);
  };

  const clearRecords = () => {
    localStorage.removeItem(TANKERS_KEY);
    setRecords([]);
  };

  return (
    <div className="page-wrap">
      <PageTitle
        eyebrow={tr("EMERGENCY WATER SERVICE", language)}
        title={tr("Book Water Tanker", language)}
        text={tr("Request a tanker and keep complete booking details for follow-up.", language)}
      />

      <div className="two-column">
        <form className="form-card" onSubmit={submit}>
          <h3>{tr("Tanker Request", language)}</h3>

          <label>
            Name
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>

          <label>
            Mobile
            <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
          </label>

          <label>
            Delivery Address
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>

          <label>
            Required Date
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>

          <label>
            Tanker Capacity
            <select value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}>
              <option>5,000 Litres</option>
              <option>7,500 Litres</option>
              <option>10,000 Litres</option>
            </select>
          </label>

          <label>
            Purpose
            <select value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              <option>{tr("Household emergency", language)}</option>
              <option>{tr("Apartment / Community", language)}</option>
              <option>{tr("Hospital / Institution", language)}</option>
              <option>{tr("Other", language)}</option>
            </select>
          </label>

          <button className="primary-button">{tr("Book Tanker", language)}</button>
          {result && <div className="success-box">{result}</div>}
        </form>

        <div className="dark-info-card">
          <span className="large-symbol">◆</span>
          <h3>{tr("Water tanker service", language)}</h3>
          <p>{tr("All submitted tanker requests are stored in this browser with the complete delivery details.", language)}</p>
          <InfoLine label={tr("Saved bookings", language)} value={`${records.length}`} />
          <InfoLine label={tr("Typical capacity", language)} value="5,000 - 10,000 L" />
          <InfoLine label={tr("Service areas", language)} value={tr("Corporation wards", language)} />
        </div>
      </div>

      <RecordPanel
        language={language}
        title={tr("Water Tanker Booking History", language)}
        count={records.length}
        onClear={clearRecords}
        empty={tr("No tanker bookings have been made yet.", language)}
      >
        {records.map((record) => (
          <div className="record-card" key={record.id}>
            <div className="record-main">
              <div className="record-id">{record.id}</div>
              <h4>{record.capacity} • {record.purpose}</h4>
              <p><b>{tr("Delivery:", language)}</b> {record.address}</p>
              <p><b>{tr("Required:", language)}</b> {record.requiredDate} • <b>{tr("Mobile:", language)}</b> {record.mobile}</p>
              <small>{tr("Booked by", language)} {record.name} • {record.date}</small>
            </div>
            <span className="record-status booked">{tr(record.status, language)}</span>
          </div>
        ))}
      </RecordPanel>
    </div>
  );
}

function RecordPanel({
  language,
  title,
  count,
  onClear,
  empty,
  children,
}: {
  language: Language;
  title: string;
  count: number;
  onClear: () => void;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="records-panel">
      <div className="records-header">
        <div>
          <span className="eyebrow">{tr("SAVED LOCALLY", language)}</span>
          <h3>{title} <span>{count}</span></h3>
        </div>
        {count > 0 && (
          <button className="clear-records" onClick={onClear}>
            {tr("Clear History", language)}
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="records-empty">{empty}</div>
      ) : (
        <div className="records-list">{children}</div>
      )}

      <p className="storage-note">
        {tr("Data is stored in this browser using localStorage. It remains after refreshing the page, but it does not automatically transfer to another laptop or browser.", language)}
      </p>
    </section>
  );
}

function ScadaSection({ language }: { language: Language }) {
  const [range, setRange] = useState("24H");
  const bars = [48, 56, 52, 67, 62, 75, 72, 81, 77, 88, 84, 94];

  return (
    <div className="page-wrap">
      <PageTitle
        eyebrow={tr("LIVE TELEMETRY", language)}
        title={tr("Tunga River & SCADA Telemetry", language)}
        text={tr("Operational overview of reservoir, treatment, pressure and distribution telemetry.", language)}
      />

      <div className="scada-toolbar">
        <div className="scada-status">
          <i className="online-dot" />
          <div>
            <b>{tr("SCADA SYSTEM ONLINE", language)}</b>
            <span>{tr("All primary telemetry channels connected", language)}</span>
          </div>
        </div>

        <div className="range-tabs">
          {["6H", "24H", "7D"].map((item) => (
            <button
              key={item}
              className={range === item ? "chosen" : ""}
              onClick={() => setRange(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="telemetry-grid">
        <Telemetry title={tr("Reservoir Level", language)} value="94.1%" sub="588.42 m" icon="💧" />
        <Telemetry title={tr("Inflow", language)} value="42.8 MLD" sub="+3.2% today" icon="↗" />
        <Telemetry title={tr("Network Pressure", language)} value="3.8 bar" sub={tr("Normal", language)} icon="◉" />
        <Telemetry title="TDS" value="112 ppm" sub={tr("Potable range", language)} icon="♧" />
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <div>
            <h3>{tr("Reservoir Level Trend", language)}</h3>
            <p>{tr("Telemetry window:", language)} {range}</p>
          </div>
          <span className="chart-live">● LIVE</span>
        </div>

        <div className="bars">
          {bars.map((height, index) => (
            <div className="bar-wrap" key={index}>
              <div className="bar" style={{ height: `${height}%` }} />
              <small>{index + 1}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="treatment-card">
        <span className="eyebrow">{tr("WATER TREATMENT PLANT", language)}</span>
        <h3>{tr("Treatment Stages", language)}</h3>

        <div className="stage-row">
          {["Raw Water", "Coagulation", "Filtration", "Disinfection", "Clear Water"].map(
            (stage, index) => (
              <div className="stage" key={stage}>
                <span>{index + 1}</span>
                <b>{tr(stage, language)}</b>
                <small>✓ {tr("Normal", language)}</small>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Telemetry({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: string;
}) {
  return (
    <div className="telemetry-card">
      <span className="telemetry-icon">{icon}</span>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

export default App;
