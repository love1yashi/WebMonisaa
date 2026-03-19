<?php
require_once '../includes/config.php';
initDB();

$page_title = 'Admin Dashboard | MONISA';
$is_admin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
$user_id = $_SESSION['user_id'] ?? 0;

if (!$is_admin) {
    header('Location: ../index.php');
    exit;
}

$active_tab = $_GET['tab'] ?? 'dashboard';

// Fetch data for tabs
$db = getDB();
$stats = [
    'users' => $db->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'products' => $db->query('SELECT COUNT(*) FROM products')->fetchColumn(),
    'orders' => $db->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
    'revenue' => $db->query('SELECT SUM(total) FROM orders')->fetchColumn() ?: 0
];

$users = $db->query('SELECT * FROM users ORDER BY created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
$products = $db->query('SELECT * FROM products')->fetchAll(PDO::FETCH_ASSOC);
$orders = $db->query('SELECT * FROM orders ORDER BY created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($page_title); ?></title>
<link rel="stylesheet" href="../../assets/css/main.css">
<link rel="stylesheet" href="../admin/admin.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="admin-body">
    <!-- Sidebar -->
    <aside class="admin-sidebar">
        <div class="sidebar-header">
            <h2 class="sidebar-logo">MONISA</h2>
            <span class="sidebar-subtitle">Admin Panel</span>
        </div>
        <nav class="sidebar-nav">
            <a href="?tab=dashboard" class="nav-item <?php echo $active_tab == 'dashboard' ? 'active' : ''; ?>" data-tab="dashboard">
                <i class="fas fa-home"></i> <span>Dashboard</span>
            </a>
            <a href="?tab=users" class="nav-item <?php echo $active_tab == 'users' ? 'active' : ''; ?>" data-tab="users">
                <i class="fas fa-users"></i> <span>Users</span>
            </a>
            <a href="?tab=products" class="nav-item <?php echo $active_tab == 'products' ? 'active' : ''; ?>" data-tab="products">
                <i class="fas fa-box"></i> <span>Products</span>
            </a>
            <a href="?tab=orders" class="nav-item <?php echo $active_tab == 'orders' ? 'active' : ''; ?>" data-tab="orders">
                <i class="fas fa-shopping-cart"></i> <span>Orders</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <div class="admin-profile-mini">
                <div class="admin-avatar">
                    <i class="fas fa-user-crown"></i>
                </div>
                <div class="admin-info">
                    <span>Administrator</span>
                    <small>Super Admin</small>
                </div>
            </div>
            <a href="../api/users.php?action=logout" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
        <!-- Dashboard Tab -->
        <div id="dashboardTab" class="tab-content <?php echo $active_tab == 'dashboard' ? 'active' : ''; ?>">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon users-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $stats['users']; ?></h3>
                        <p>Total Users</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon products-icon"><i class="fas fa-box"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $stats['products']; ?></h3>
                        <p>Total Products</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orders-icon"><i class="fas fa-shopping-bag"></i></div>
                    <div class="stat-info">
                        <h3><?php echo $stats['orders']; ?></h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon revenue-icon"><i class="fas fa-peso-sign"></i></div>
                    <div class="stat-info">
                        <h3>₱<?php echo number_format($stats['revenue'], 2); ?></h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Tab -->
        <div id="usersTab" class="tab-content <?php echo $active_tab == 'users' ? 'active' : ''; ?>">
            <div class="content-header">
                <h3>User Management</h3>
                <button class="add-btn" onclick="openAdminModal('addUserModal')">+ Add User</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $user): ?>
                        <tr>
                            <td><?php echo $user['id']; ?></td>
                            <td><?php echo htmlspecialchars($user['name']); ?></td>
                            <td><?php echo htmlspecialchars($user['email']); ?></td>
                            <td><?php echo date('M j', strtotime($user['created_at'])); ?></td>
                            <td>
                                <button onclick="editUser(<?php echo $user['id']; ?>)">Edit</button>
                                <button onclick="deleteUser(<?php echo $user['id']; ?>)" class="btn-danger">Delete</button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($users)): ?>
                        <tr><td colspan="5" class="empty-message">No users yet</td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Products Tab -->
        <div id="productsTab" class="tab-content <?php echo $active_tab == 'products' ? 'active' : ''; ?>">
            <div class="content-header">
                <h3>Product Management</h3>
                <button class="add-btn" onclick="openAdminModal('addProductModal')">+ Add Product</button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $product): ?>
                        <tr>
                            <td><?php echo $product['id']; ?></td>
                            <td><?php echo htmlspecialchars($product['name']); ?></td>
                            <td>₱<?php echo number_format($product['price'], 2); ?></td>
                            <td><?php echo htmlspecialchars($product['category']); ?></td>
                            <td><?php echo $product['stock']; ?></td>
                            <td>
                                <button onclick="editProduct(<?php echo $product['id']; ?>)">Edit</button>
                                <button onclick="deleteProduct(<?php echo $product['id']; ?>)" class="btn-danger">Delete</button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Orders Tab -->
        <div id="ordersTab" class="tab-content <?php echo $active_tab == 'orders' ? 'active' : ''; ?>">
            <div class="content-header">
                <h3>Order Management</h3>
            </div>
            <div class="orders-container">
                <?php foreach ($orders as $order): ?>
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">Order #<?php echo $order['id']; ?></span>
                        <span class="order-status <?php echo $order['status']; ?>"><?php echo ucfirst($order['status']); ?></span>
                    </div>
                    <div class="order-details">
                        <div><strong>Customer:</strong> <?php echo htmlspecialchars($order['customer_name']); ?></div>
                        <div><strong>Email:</strong> <?php echo htmlspecialchars($order['customer_email']); ?></div>
                        <div><strong>Total:</strong> ₱<?php echo number_format($order['total'], 2); ?></div>
                        <div><strong>Date:</strong> <?php echo date('M j, Y', strtotime($order['created_at'])); ?></div>
                    </div>
                    <div>
                        <button onclick="updateOrderStatus(<?php echo $order['id']; ?>, 'processing')">Processing</button>
                        <button onclick="updateOrderStatus(<?php echo $order['id']; ?>, 'shipped')">Shipped</button>
                        <button onclick="updateOrderStatus(<?php echo $order['id']; ?>, 'delivered')">Delivered</button>
                    </div>
                </div>
                <?php endforeach; ?>
                <?php if (empty($orders)): ?>
                <p class="empty-message">No orders yet</p>
                <?php endif; ?>
            </div>
        </div>
        <?php include 'admin-modals-container.html'; ?>
    </main>

    <script src="../admin/admin.js"></script>
    <script>
        // Admin JS functions pointing to PHP APIs
        async function deleteUser(id) {
            const confirmed = await openConfirmModal('Delete user?');
            if (!confirmed) return;

            fetch('../api/users.php?action=delete', {
                method: 'POST',
                body: new URLSearchParams({id: id})
            }).then(() => location.reload());
        }
        
        async function deleteProduct(id) {
            const confirmed = await openConfirmModal('Delete product?');
            if (!confirmed) return;

            fetch('../api/products.php?action=delete', {
                method: 'POST',
                body: new URLSearchParams({id: id})
            }).then(() => location.reload());
        }
        
        function updateOrderStatus(id, status) {
            fetch('../api/orders.php?action=update_status', {
                method: 'POST',
                body: new URLSearchParams({id: id, status: status})
            }).then(() => location.reload());
        }
    </script>
</body>
</html>
