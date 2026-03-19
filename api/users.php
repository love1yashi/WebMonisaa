<?php
require_once '../includes/config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'register':
            $name = $_POST['name'] ?? '';
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            if (empty($name) || empty($email) || empty($password)) {
                echo json_encode(['success' => false, 'message' => 'All fields required']);
                exit;
            }

            $db = getDB();
            $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                echo json_encode(['success' => false, 'message' => 'Email already registered']);
                exit;
            }

            $stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
            $stmt->execute([$name, $email, $password]);
            
            $_SESSION['user_id'] = $db->lastInsertId();
            $_SESSION['user_name'] = $name;
            
            echo json_encode(['success' => true, 'message' => 'Registered successfully']);
            break;

        case 'login':
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            $db = getDB();
            $stmt = $db->prepare('SELECT id, name FROM users WHERE email = ? AND password = ?');
            $stmt->execute([$email, $password]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                echo json_encode(['success' => true, 'message' => 'Login successful']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            }
            break;

        case 'logout':
            session_destroy();
            echo json_encode(['success' => true]);
            break;

        case 'get_all':
            $db = getDB();
            $stmt = $db->query('SELECT id, name, email FROM users ORDER BY created_at DESC');
            echo json_encode(['success' => true, 'users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;

        case 'delete':
            $id = $_POST['id'] ?? 0;
            $db = getDB();
            $stmt = $db->prepare('DELETE FROM users WHERE id = ?');
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

