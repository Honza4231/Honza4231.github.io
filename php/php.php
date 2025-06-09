<?php
/**
 * Hotel Monarch Prague - Rezervační formulář
 * Zpracování rezervačních dat
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Kontrola, zda byla data odeslána metodou POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda není povolena']);
    exit;
}

// Získání a sanitizace vstupních dat
$firstName = isset($_POST['firstName']) ? trim(htmlspecialchars($_POST['firstName'])) : '';
$lastName = isset($_POST['lastName']) ? trim(htmlspecialchars($_POST['lastName'])) : '';
$email = isset($_POST['email']) ? trim(htmlspecialchars($_POST['email'])) : '';
$checkin = isset($_POST['checkin']) ? $_POST['checkin'] : '';
$checkout = isset($_POST['checkout']) ? $_POST['checkout'] : '';
$guests = isset($_POST['guests']) ? intval($_POST['guests']) : 2;
$roomType = isset($_POST['roomType']) ? $_POST['roomType'] : 'standard';
$totalPrice = isset($_POST['totalPrice']) ? $_POST['totalPrice'] : '0 Kč';

// Validace povinných polí
$errors = [];

if (empty($firstName)) {
    $errors[] = 'Jméno je povinné';
}

if (empty($lastName)) {
    $errors[] = 'Příjmení je povinné';
}

if (empty($email)) {
    $errors[] = 'Email je povinný';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Neplatný formát emailu';
}

if (empty($checkin)) {
    $errors[] = 'Datum příjezdu je povinné';
}

if (empty($checkout)) {
    $errors[] = 'Datum odjezdu je povinné';
}

// Validace dat
if (!empty($checkin) && !empty($checkout)) {
    $checkinDate = DateTime::createFromFormat('Y-m-d', $checkin);
    $checkoutDate = DateTime::createFromFormat('Y-m-d', $checkout);
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    
    if (!$checkinDate || !$checkoutDate) {
        $errors[] = 'Neplatný formát data';
    } elseif ($checkinDate < $today) {
        $errors[] = 'Datum příjezdu nemůže být v minulosti';
    } elseif ($checkoutDate <= $checkinDate) {
        $errors[] = 'Datum odjezdu musí být po datu příjezdu';
    }
}

// Validace počtu hostů
if ($guests < 1 || $guests > 6) {
    $errors[] = 'Počet hostů musí být mezi 1 a 6';
}

// Validace typu pokoje
$allowedRoomTypes = ['standard', 'luxury', 'penthouse'];
if (!in_array($roomType, $allowedRoomTypes)) {
    $errors[] = 'Neplatný typ pokoje';
}

// Pokud jsou chyby, vrať je
if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Příprava dat pro uložení
$reservationData = [
    'id' => uniqid(),
    'timestamp' => date('Y-m-d H:i:s'),
    'firstName' => $firstName,
    'lastName' => $lastName,
    'email' => $email,
    'checkin' => $checkin,
    'checkout' => $checkout,
    'guests' => $guests,
    'roomType' => $roomType,
    'totalPrice' => $totalPrice,
    'status' => 'pending'
];

// Převod názvu pokoje pro zobrazení
$roomNames = [
    'standard' => 'Standard Room',
    'luxury' => 'Luxury Suite',
    'penthouse' => 'Exclusive Penthouse'
];

try {
    // Uložení do souboru (v reálné aplikaci by to bylo do databáze)
    $filename = '../reservations/reservation_' . date('Y-m-d') . '.txt';
    
    // Vytvoření složky pokud neexistuje
    $directory = dirname($filename);
    if (!is_dir($directory)) {
        mkdir($directory, 0755, true);
    }
    
    // Příprava řádku pro uložení
    $line = sprintf(
        "[%s] Rezervace #%s - %s %s (%s) | %s - %s | %d osob | %s | %s\n",
        $reservationData['timestamp'],
        $reservationData['id'],
        $firstName,
        $lastName,
        $email,
        date('d.m.Y', strtotime($checkin)),
        date('d.m.Y', strtotime($checkout)),
        $guests,
        $roomNames[$roomType],
        $totalPrice
    );
    
    // Uložení do souboru
    if (file_put_contents($filename, $line, FILE_APPEND | LOCK_EX) === false) {
        throw new Exception('Chyba při ukládání rezervace');
    }
    
    // Simulace odeslání emailu (v reálné aplikaci)
    $emailSent = sendConfirmationEmail($reservationData);
    
    // Úspěšná odpověď
    echo json_encode([
        'success' => true,
        'message' => 'Rezervace byla úspěšně odeslána',
        'reservationId' => $reservationData['id']
    ]);
    
} catch (Exception $e) {
    // Chyba při zpracování
    error_log('Reservation error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Chyba při zpracování rezervace'
    ]);
}

/**
 * Simulace odeslání potvrzovacího emailu
 * V reálné aplikaci byste použili PHPMailer nebo podobnou knihovnu
 */
function sendConfirmationEmail($data) {
    // Simulujeme úspěšné odeslání emailu
    error_log("Email sent to: " . $data['email'] . " for reservation: " . $data['id']);
    return true;
}

/**
 * Funkce pro výpočet ceny (server-side validace)
 */
function calculateTotalPrice($checkin, $checkout, $guests, $roomType) {
    $roomPrices = [
        'standard' => 2000,
        'luxury' => 4500,
        'penthouse' => 8000
    ];
    
    $checkinDate = new DateTime($checkin);
    $checkoutDate = new DateTime($checkout);
    $nights = $checkinDate->diff($checkoutDate)->days;
    
    $totalPrice = $roomPrices[$roomType] * $nights;
    
    // Poplatek za extra osoby
    if ($guests > 2) {
        $extraGuests = $guests - 2;
        $totalPrice += $extraGuests * 500 * $nights;
    }
    
    return $totalPrice;
}
?>
