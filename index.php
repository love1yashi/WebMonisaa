<?php
require_once 'includes/config.php';
initDB();

$page_title = 'MONISA | Modesty At Ease';
$extra_css = ['assets/css/all.css'];
$extra_js = ['assets/js/main.js', 'cart/cart.js', 'user/user.js', 'modal/modal.js'];

$category = $_GET['category'] ?? '';
$products_json = file_get_contents("http://localhost:8000/api/products.php?action=get_all" . ($category ? "&category=" . urlencode($category) : ""));
$products = json_decode($products_json, true)['products'] ?? [];

$session_id = session_id();
$_SESSION['session_id'] = $session_id; // For cart tracking
?>
<?php include 'includes/header.php'; ?>

<!-- Hero Slider -->
<div class="slider-container">
    <div class="slide active" style="background-image: url('images/home1.jpg');"></div>
    <div class="slide" style="background-image: url('images/home.webp');"></div>
</div>
<div class="hero-content">
    <p>MODESTY AT EASE</p>
    <h1>MONISA</h1>
</div>
<div class="slider-dots">
    <span class="dot active"></span>
    <span class="dot"></span>
</div>

<!-- Collection Summary (static cards) -->
<section class="collection-summary">
    <div class="col-card">
        <img src="images/hayatdress.jpg" alt="Printed">
        <div class="col-overlay">Printed</div>
    </div>
    <div class="col-card">
        <img src="images/muneerahdress.jpg" alt="Apparel">
        <div class="col-overlay">Apparel</div>
    </div>
    <div class="col-card">
        <img src="images/frenchmousse1.jpg" alt="Shawl">
        <div class="col-overlay">Shawl</div>
    </div>
    <div class="col-card">
        <img src="images/niqab1.jpg" alt="Instant">
        <div class="col-overlay">Instant</div>
    </div>
</section>

<!-- Dynamic Product Sections -->
<?php if (!empty($products)): ?>
    <h2 class="section-title"><?php echo ucfirst($category ?: 'Featured'); ?> Collection</h2>
    <div class="tabs">
        <button class="tab-btn active">All</button>
    </div>
    <div class="product-grid">
        <?php foreach ($products as $product): ?>
        <div class="product-card" data-id="<?php echo $product['id']; ?>" data-name="<?php echo htmlspecialchars($product['name']); ?>" data-price="<?php echo $product['price']; ?>" data-image="<?php echo htmlspecialchars($product['image']); ?>">
            <div class="img-container">
                <img src="<?php echo htmlspecialchars($product['image']); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>">
                <div class="quick-view-btn">👁</div>
            </div>
            <div class="p-name"><?php echo htmlspecialchars($product['name']); ?></div>
            <div class="p-price">₱<?php echo number_format($product['price'], 2); ?></div>
            <button class="add-to-cart-btn" onclick="addToCart(<?php echo $product['id']; ?>)">Add to Cart</button>
        </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?php include 'includes/footer.php'; ?>

<script>
function addToCart(productId) {
    fetch('api/cart.php?action=add', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: 'product_id=' + productId + '&quantity=1'
    }).then(res => res.json()).then(data => {
        if (data.success) {
            showToast('Added to cart!');
            updateCartBadge();
        }
    });
}
</script>
