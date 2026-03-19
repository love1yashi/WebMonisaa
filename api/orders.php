<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$session_id = session_id();

try {
    $db = getDB();

    switch ($action) {
        case 'create':
            $customer_name = $_POST['customer_name'] ?? '';
            $customer_email = $_POST['customer_email'] ?? '';
            $items = $_POST['items'] ?? '[]';
            $total = (float)($_POST['total'] ?? 0);
            $shipping_address = $_POST['shipping_address'] ?? '{}';

            if (empty($customer_name) || empty($items) || $total <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid order data']);
                exit;
            }

            $stmt = $db->prepare('INSERT INTO orders (session_id, customer_name, customer_email, items, total, shipping_address) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$session_id, $customer_name, $customer_email, $items, $total, $shipping_address]);
            
            // Clear cart
            $clear = $db->prepare('DELETE FROM cart_items WHERE session_id = ?');
            $clear->execute([$session_id]);
            unset($_SESSION['cart_count']);
            
            echo json_encode(['success' => true, 'order_id' => $db->lastInsertId()]);
            break;

        case 'get_all':
            $stmt = $db->query('SELECT * FROM orders ORDER BY created_at DESC');
            echo json_encode(['success' => true, 'orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'get_user':
            $email = $_GET['email'] ?? $_SESSION['user_email'] ?? '';
            $stmt = $db->prepare('SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC');
            $stmt->execute([$email]);
            echo json_encode(['success' => true, 'orders' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'update_status':
            $id = (int)($_POST['id'] ?? 0);
            $status = $_POST['status'] ?? '';
            $stmt = $db->prepare('UPDATE orders SET status = ? WHERE id = ?');
            $stmt->execute([$status, $id]);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

