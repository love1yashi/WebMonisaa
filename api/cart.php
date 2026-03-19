<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$session_id = session_id();

try {
    $db = getDB();

    switch ($action) {
        case 'get':
            $stmt = $db->prepare('SELECT c.*, p.name, p.price, p.image FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.session_id = ?');
            $stmt->execute([$session_id]);
            echo json_encode(['success' => true, 'items' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'add':
            $product_id = (int)($_POST['product_id'] ?? 0);
            $quantity = (int)($_POST['quantity'] ?? 1);

            // Check if exists
            $stmt = $db->prepare('SELECT id FROM cart_items WHERE session_id = ? AND product_id = ?');
            $stmt->execute([$session_id, $product_id]);
            if ($stmt->fetch()) {
                $stmt = $db->prepare('UPDATE cart_items SET quantity = quantity + ? WHERE session_id = ? AND product_id = ?');
                $stmt->execute([$quantity, $session_id, $product_id]);
            } else {
                $stmt = $db->prepare('INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)');
                $stmt->execute([$session_id, $product_id, $quantity]);
            }
            $_SESSION['cart_count'] = ($_SESSION['cart_count'] ?? 0) + $quantity;
            echo json_encode(['success' => true]);
            break;

        case 'update':
            $id = (int)($_POST['id'] ?? 0);
            $quantity = (int)($_POST['quantity'] ?? 0);
            if ($quantity <= 0) {
                $stmt = $db->prepare('DELETE FROM cart_items WHERE id = ? AND session_id = ?');
                $stmt->execute([$id, $session_id]);
            } else {
                $stmt = $db->prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND session_id = ?');
                $stmt->execute([$quantity, $id, $session_id]);
            }
            echo json_encode(['success' => true]);
            break;

        case 'delete':
            $id = (int)($_POST['id'] ?? 0);
            $stmt = $db->prepare('DELETE FROM cart_items WHERE id = ? AND session_id = ?');
            $stmt->execute([$id, $session_id]);
            echo json_encode(['success' => true]);
            break;

        case 'clear':
            $stmt = $db->prepare('DELETE FROM cart_items WHERE session_id = ?');
            $stmt->execute([$session_id]);
            unset($_SESSION['cart_count']);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

