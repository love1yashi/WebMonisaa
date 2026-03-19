        </section>

        <section class="newsletter">
            <h2>Join the Modest Squad</h2>
            <p>Subscribe to our newsletter for the latest updates and offers.</p>
            <div class="email-box">
                <form method="POST" action="subscribe.php">
                    <input type="email" name="email" placeholder="Your email address" required>
                    <button type="submit">Subscribe</button>
                </form>
            </div>
        </section>

        <footer>
            <div class="footer-col">
                <h4>About Us</h4>
                <p>Monisa Modesty specializes in premium hijabs and modest fashion for the modern woman.</p>
            </div>
            <div class="footer-col">
                <h4>Information</h4>
                <ul>
                    <li><a href="#">Our Story</a></li>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">Store Locator</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Customer Care</h4>
                <ul>
                    <li><a href="#">Shipping Policy</a></li>
                    <li><a href="#">Return & Exchange</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h4>Follow Us</h4>
                <p>Instagram: @monisamodesty</p>
                <p>TikTok: @monisamodesty</p>
            </div>
        </footer>

        <div class="footer-bottom">
            <p>© 2026 MONISA Modesty. All Rights Reserved.</p>
            <p>Philippines No.1 Modest Dress Specialist</p>
        </div>

        <!-- Modals (login, signup, cart, checkout, etc.) -->
        <div class="modal" id="loginModal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Login</h2>
                <form method="POST" action="api/users.php?action=login">
                    <input type="email" name="email" placeholder="Email" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>

        <!-- Cart Sidebar -->
        <div class="cart-sidebar" id="cartSidebar">
            <div class="cart-header">
                <h2>Shopping Cart</h2>
                <span class="close-cart">&times;</span>
            </div>
            <div class="cart-items" id="cartItems">
                <p>Your cart is empty.</p>
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total: <span id="cartTotal">₱0.00</span></span>
                </div>
                <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
            </div>
        </div>

        <!-- Toast Container -->
        <div id="toastContainer"></div>

        <?php if (isset($extra_js)): foreach($extra_js as $js): ?>
            <script src="<?php echo htmlspecialchars($js); ?>"></script>
        <?php endforeach; endif; ?>
        <script src="assets/js/main.js"></script>
    </body>
</html>

