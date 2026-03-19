<?php
require_once '../includes/config.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: ../index.php');
    exit;
}

$page_title = 'User Profile | MONISA';
$db = getDB();
$stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$orders = $db->prepare('SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC');
$orders->execute([$user['email']]);
$orders = $orders->fetchAll(PDO::FETCH_ASSOC);
?>
<?php include '../includes/header.php'; ?>
<div class="page-container">
    <h1>My Account</h1>
    
    <div class="user-profile">
        <h2>Profile Information</h2>
        <p><strong>Name:</strong> <?php echo htmlspecialchars($user['name']); ?></p>
        <p><strong>Email:</strong> <?php echo htmlspecialchars($user['email']); ?></p>
        <a href="#" onclick="showEditProfile()">Edit Profile</a>
    </div>

    <div class="user-orders">
        <h2>My Orders</h2>
        <?php if ($orders): ?>
            <?php foreach ($orders as $order): ?>
            <div class="order-card">
                <h4>Order #<?php echo $order['id']; ?> - <?php echo date('M j, Y', strtotime($order['created_at'])); ?></h4>
                <p>Status: <span class="status <?php echo $order['status']; ?>"><?php echo ucfirst($order['status']); ?></span></p>
                <p>Total: ₱<?php echo number_format($order['total'], 2); ?></p>
            </div>
            <?php endforeach; ?>
        <?php else: ?>
            <p>No orders yet.</p>
        <?php endif; ?>
    </div>
</div>
<?php include '../includes/footer.php'; ?>

