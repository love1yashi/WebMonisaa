<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? htmlspecialchars($page_title) : 'MONISA | Modesty At Ease'; ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/all.css">
    <?php if (isset($extra_css)): foreach($extra_css as $css): ?>
        <link rel="stylesheet" href="<?php echo htmlspecialchars($css); ?>">
    <?php endforeach; endif; ?>
</head>
<body>
    <section class="hero-section">
        <header>
            <a href="index.php" class="logo">MONISA MODESTY</a>
            <nav class="main-menu">
                <div class="nav-item">
                    <a href="index.php?category=dress">DRESS •</a>
                    <div class="dropdown">
                        <a href="product.php?id=d1">HAYAT DRESS</a>
                        <a href="product.php?id=d2">MUNEERAH DRESS</a>
                        <a href="product.php?id=d3">NYLA DRESS</a>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="index.php?category=scarves">SCARVES •</a>
                    <div class="dropdown">
                        <a href="product.php?id=s1">FRENCH MOUSSE</a>
                        <a href="product.php?id=s2">BELGIAN HIJAB</a>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="index.php?category=niqab">NIQAB •</a>
                    <div class="dropdown">
                        <a href="product.php?id=n1">SINGLE CURVE NIQAB</a>
                    </div>
                </div>
            </nav>
            <div class="header-icons">
                <img src="https://img.icons8.com/material-outlined/24/search.png" alt="Search" class="search-icon">
                <div class="user-menu-container" id="userMenuContainer">
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <div class="user-info" id="loggedInMenu">
                            <img src="https://img.icons8.com/material-outlined/24/user.png" alt="User" class="user-icon">
                            <span>Welcome, <?php echo htmlspecialchars($_SESSION['user_name']); ?></span>
                            <div class="dropdown">
                                <a href="#" onclick="showMyOrders()">My Orders</a>
                                <a href="user/user.php">Profile</a>
                                <a href="#" onclick="logout()">Logout</a>
                            </div>
                        </div>
                    <?php else: ?>
                        <img src="https://img.icons8.com/material-outlined/24/user.png" alt="User" class="user-icon" id="userIcon">
                        <div class="user-dropdown" id="userDropdown">
                            <button onclick="showLoginModal()">Login</button>
                            <button onclick="showSignupModal()">Sign Up</button>
                            <button onclick="showAdminLogin()">Admin Login</button>
                        </div>
                    <?php endif; ?>
                    <?php if (isset($_SESSION['is_admin'])): ?>
                        <span class="admin-badge">👑</span>
                    <?php endif; ?>
                </div>
                <div class="cart-container">
                    <img src="https://img.icons8.com/material-outlined/24/shopping-bag.png" alt="Cart" class="cart-icon" id="cartIcon">
                    <span class="cart-badge" id="cartBadge"><?php echo isset($_SESSION['cart_count']) ? $_SESSION['cart_count'] : 0; ?></span>
                </div>
            </div>
        </header>
