<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    $db = getDB();

    switch ($action) {
        case 'get_all':
            $category = $_GET['category'] ?? '';
            $sql = 'SELECT * FROM products';
            $params = [];
            if ($category) {
                $sql .= ' WHERE category = ?';
                $params[] = $category;
            }
            $sql .= ' ORDER BY name';
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            echo json_encode(['success' => true, 'products' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'get':
            $id = $_GET['id'] ?? $_POST['id'] ?? 0;
            $stmt = $db->prepare('SELECT * FROM products WHERE id = ?');
            $stmt->execute([$id]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'product' => $product ?: null]);
            break;

        case 'create':
            $name = $_POST['name'] ?? '';
            $price = (float)($_POST['price'] ?? 0);
            $category = $_POST['category'] ?? '';
            $image = $_POST['image'] ?? '';
            $stock = (int)($_POST['stock'] ?? 0);
            $description = $_POST['description'] ?? '';

            $stmt = $db->prepare('INSERT INTO products (name, price, category, image, stock, description) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$name, $price, $category, $image, $stock, $description]);
            echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
            break;

        case 'update':
            $id = $_POST['id'] ?? 0;
            $name = $_POST['name'] ?? '';
            $price = (float)($_POST['price'] ?? 0);
            $category = $_POST['category'] ?? '';
            $image = $_POST['image'] ?? '';
            $stock = (int)($_POST['stock'] ?? 0);
            $description = $_POST['description'] ?? '';

            $stmt = $db->prepare('UPDATE products SET name=?, price=?, category=?, image=?, stock=?, description=? WHERE id=?');
            $stmt->execute([$name, $price, $category, $image, $stock, $description, $id]);
            echo json_encode(['success' => true]);
            break;

        case 'delete':
            $id = $_POST['id'] ?? 0;
            $stmt = $db->prepare('DELETE FROM products WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

