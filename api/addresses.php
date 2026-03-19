<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$session_id = session_id();

try {
    $db = getDB();

    switch ($action) {
        case 'get':
            $stmt = $db->prepare('SELECT * FROM addresses WHERE session_id = ?');
            $stmt->execute([$session_id]);
            echo json_encode(['success' => true, 'addresses' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'create':
            $name = $_POST['name'] ?? '';
            $phone = $_POST['phone'] ?? '';
            $street = $_POST['street'] ?? '';
            $barangay = $_POST['barangay'] ?? '';
            $city = $_POST['city'] ?? '';
            $province = $_POST['province'] ?? '';
            $postal = $_POST['postal'] ?? '';

            $is_default = empty($_POST['is_default']) ? 0 : 1;
            
            $stmt = $db->prepare('INSERT INTO addresses (session_id, name, phone, street, barangay, city, province, postal, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$session_id, $name, $phone, $street, $barangay, $city, $province, $postal, $is_default]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            break;

        case 'delete':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $db->prepare('DELETE FROM addresses WHERE id = ? AND session_id = ?');
            $stmt->execute([$id, $session_id]);
            echo json_encode(['success' => true]);
            break;

        case 'set_default':
            $id = (int)($_POST['id'] ?? 0);
            // Unset all defaults first
            $unset = $db->prepare('UPDATE addresses SET is_default = 0 WHERE session_id = ?');
            $unset->execute([$session_id]);
            // Set new default
            $set = $db->prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND session_id = ?');
            $set->execute([$id, $session_id]);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

