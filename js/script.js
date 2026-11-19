document.addEventListener("DOMContentLoaded", function () {
    // 1. تسجيل حساب جديد (register.html)
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        const regMsg = document.getElementById("registerMsg");

        const showRegMessage = function (text, isError) {
            if (!regMsg) return;
            regMsg.textContent = text;
            regMsg.style.display = "block";
            if (isError) {
                regMsg.style.color = "#e63946";
                regMsg.style.background = "#fff0f1";
                regMsg.style.border = "1px solid #f5c2c7";
            } else {
                regMsg.style.color = "#1e7e34";
                regMsg.style.background = "#edf7ed";
                regMsg.style.border = "1px solid #b7dfb9";
            }
        };

        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const firstNameEl = document.getElementById("firstName");
            const lastNameEl = document.getElementById("lastName");
            const emailEl = document.getElementById("regEmail");
            const passwordEl = document.getElementById("regPassword");

            if (!firstNameEl || !lastNameEl || !emailEl || !passwordEl) {
                showRegMessage("Please make sure all input fields exist.", true);
                return;
            }

            const firstName = firstNameEl.value.trim();
            const lastName = lastNameEl.value.trim();
            const email = emailEl.value.trim();
            const password = passwordEl.value;

            if (!firstName || !lastName || !email || !password) {
                showRegMessage("Please fill in all fields.", true);
                return;
            }

            const userData = {
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`.trim(),
                email: email,
                password: password
            };

            localStorage.setItem("romaRegisteredUser", JSON.stringify(userData));
            showRegMessage("Account created successfully! Redirecting to login...", false);

            setTimeout(function () {
                window.location.href = "login.html";
            }, 900);
        });
    }

    // 2. تسجيل الدخول (login.html)
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        const loginError = document.getElementById("loginError");

        const showLoginError = function (message) {
            if (loginError) {
                loginError.textContent = message;
                loginError.style.display = "block";
            } else {
                alert(message);
            }
        };

        const hideLoginError = function () {
            if (loginError) {
                loginError.textContent = "";
                loginError.style.display = "none";
            }
        };

        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            hideLoginError();

            const emailEl = document.getElementById("loginEmail");
            const passwordEl = document.getElementById("loginPassword");
            const savedUser = JSON.parse(localStorage.getItem("romaRegisteredUser"));

            const enteredEmail = emailEl ? emailEl.value.trim() : "";
            const enteredPassword = passwordEl ? passwordEl.value : "";

            if (!savedUser) {
                showLoginError("No registered account found. Please register first.");
                return;
            }

            if (savedUser.email === enteredEmail && savedUser.password === enteredPassword) {
                localStorage.setItem("romaActiveUser", JSON.stringify(savedUser));
                window.location.href = "index.html";
            } else {
                showLoginError("Invalid email or password. Please try again.");
            }
        });
    }

    // دوال مساعدة للسلة
    const getCart = function () {
        return JSON.parse(localStorage.getItem("lomaCart")) || [];
    };

    const saveCart = function (cart) {
        localStorage.setItem("lomaCart", JSON.stringify(cart));
        updateCartCount();
    };

    const updateCartCount = function () {
        const cart = getCart();
        const totalItems = cart.reduce(function (sum, item) {
            return sum + item.quantity;
        }, 0);
        const cartCountEl = document.getElementById("cartCount");
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
        }
    };

    const addItemToCart = function (product) {
        const cart = getCart();
        const existingItem = cart.find(function (item) {
            return item.name === product.name && item.image === product.image;
        });

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        saveCart(cart);
    };

    // دوال مساعدة للمفضلة
    const getFavorites = function () {
        return JSON.parse(localStorage.getItem("lomaFavorites")) || [];
    };

    const saveFavorites = function (favs) {
        localStorage.setItem("lomaFavorites", JSON.stringify(favs));
        updateFavCount();
    };

    const updateFavCount = function () {
        const favs = getFavorites();
        const favCountEl = document.getElementById("favCount");
        if (favCountEl) {
            favCountEl.textContent = favs.length;
        }
    };

    // 3. تحديث الهيدر في الصفحة الرئيسية (المفضلة + السلة + Logout + Hi, الاسم في الآخر)
    const headerButtons = document.querySelector(".header-buttons");
    const activeUser = JSON.parse(localStorage.getItem("romaActiveUser"));

    if (headerButtons && activeUser) {
        const displayName = activeUser.firstName || activeUser.fullName || "User";

        headerButtons.innerHTML = `
            <a href="favorites.html" class="btn" id="favLink">
                <i class="fa-solid fa-heart"></i> Favorites (<span id="favCount">0</span>)
            </a>
            <a href="cart.html" class="btn" id="cartLink">
                <i class="fa-solid fa-cart-shopping"></i> Cart (<span id="cartCount">0</span>)
            </a>
            <button type="button" id="logoutBtn" class="btn" style="cursor: pointer;">Logout</button>
            <span class="user-greeting" style="font-weight: 700; color: #b8860b; font-size: 16px; display: inline-flex; align-items: center;">Hi, ${displayName}</span>
        `;

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                localStorage.removeItem("romaActiveUser");
                window.location.reload();
            });
        }
    }

    updateCartCount();
    updateFavCount();

    // 4. البحث والفلترة حسب التصنيف في الصفحة الرئيسية (index.html)
    const categoryFilter = document.getElementById("categoryFilter");
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const productCards = document.querySelectorAll(".product-card");

    if (productCards.length > 0 && (categoryFilter || searchInput)) {
        const filterProducts = function () {
            const selectedCategory = categoryFilter
                ? categoryFilter.value.toLowerCase().trim()
                : "";
            const searchText = searchInput
                ? searchInput.value.toLowerCase().trim()
                : "";

            productCards.forEach(function (card) {
                const titleEl = card.querySelector(".product-info h3");
                const categoryEl = Array.from(
                    card.querySelectorAll(".product-info p")
                ).find(function (p) {
                    return p.textContent.toLowerCase().includes("category:");
                });

                const productName = titleEl ? titleEl.textContent.toLowerCase() : "";
                const productCategoryText = categoryEl
                    ? categoryEl.textContent.toLowerCase()
                    : "";

                let matchesCategory = true;
                if (selectedCategory === "dresses") {
                    matchesCategory = productCategoryText.includes("dress");
                } else if (selectedCategory === "suits") {
                    matchesCategory = productCategoryText.includes("suit");
                } else if (selectedCategory === "bouquets") {
                    matchesCategory = productCategoryText.includes("bouquet");
                }

                const matchesSearch = productName.includes(searchText);

                if (matchesCategory && matchesSearch) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        };

        if (categoryFilter) {
            categoryFilter.addEventListener("change", filterProducts);
        }
        if (searchInput) {
            searchInput.addEventListener("input", filterProducts);
        }
        if (searchBtn) {
            searchBtn.addEventListener("click", filterProducts);
        }
    }

    // استخراج بيانات المنتج من الكارت
    const extractCardData = function (card, index) {
        const titleEl = card.querySelector(".product-info h3");
        const imgEl = card.querySelector("img");
        const priceEl = Array.from(
            card.querySelectorAll(".product-info p")
        ).find(function (p) {
            return p.textContent.toLowerCase().includes("price:");
        });
        const categoryEl = Array.from(
            card.querySelectorAll(".product-info p")
        ).find(function (p) {
            return p.textContent.toLowerCase().includes("category:");
        });

        const name = titleEl ? titleEl.textContent.trim() : `Product ${index + 1}`;
        const image = imgEl ? imgEl.getAttribute("src") : "";
        const priceText = priceEl ? priceEl.textContent : "0";
        const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
        const category = categoryEl
            ? categoryEl.textContent.replace(/category:/i, "").trim()
            : "";

        return { name: name, price: price, image: image, category: category };
    };

    // 5. إضافة المنتجات للسلة من الصفحة الرئيسية (Add to Cart)
    if (productCards.length > 0) {
        productCards.forEach(function (card, index) {
            const addBtn = card.querySelector(".actions button");
            if (!addBtn) return;

            addBtn.addEventListener("click", function () {
                const productData = extractCardData(card, index);
                addItemToCart(productData);

                const originalText = addBtn.textContent;
                addBtn.textContent = "Added ✓";
                setTimeout(function () {
                    addBtn.textContent = originalText;
                }, 800);
            });
        });
    }

    // 6. تفعيل زرار القلب (المفضلة) في الصفحة الرئيسية (index.html)
    if (productCards.length > 0) {
        const currentFavs = getFavorites();

        productCards.forEach(function (card, index) {
            const heartIcon = card.querySelector(".actions i");
            if (!heartIcon) return;

            const productData = extractCardData(card, index);
            heartIcon.style.cursor = "pointer";

            const isAlreadyFav = currentFavs.some(function (item) {
                return item.name === productData.name && item.image === productData.image;
            });

            if (isAlreadyFav) {
                heartIcon.classList.remove("fa-regular");
                heartIcon.classList.add("fa-solid", "is-favorite");
            }

            heartIcon.addEventListener("click", function () {
                let favs = getFavorites();
                const existingIdx = favs.findIndex(function (item) {
                    return item.name === productData.name && item.image === productData.image;
                });

                if (existingIdx > -1) {
                    favs.splice(existingIdx, 1);
                    heartIcon.classList.remove("fa-solid", "is-favorite");
                    heartIcon.classList.add("fa-regular");
                } else {
                    favs.push(productData);
                    heartIcon.classList.remove("fa-regular");
                    heartIcon.classList.add("fa-solid", "is-favorite");
                }

                saveFavorites(favs);
            });
        });
    }

    // 7. عرض وإدارة المنتجات في صفحة المفضلة (favorites.html)
    const favItemsContainer = document.getElementById("favItems");
    const clearFavBtn = document.getElementById("clearFavBtn");

    if (favItemsContainer) {
        const renderFavorites = function () {
            const favs = getFavorites();
            favItemsContainer.innerHTML = "";

            if (favs.length === 0) {
                favItemsContainer.innerHTML = `<p style="text-align:center; padding: 30px; font-size: 18px;">Your favorites list is currently empty.</p>`;
                return;
            }

            favs.forEach(function (item, idx) {
                const row = document.createElement("div");
                row.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 15px; border-bottom: 1px solid #eee; flex-wrap: wrap;";

                row.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 75px; height: 90px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <h3 style="margin-bottom: 5px;">${item.name}</h3>
                            <p style="color: #666;">Price: $${item.price}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button type="button" class="move-to-cart btn" data-index="${idx}" style="cursor: pointer;">Add to Cart</button>
                        <button type="button" class="remove-fav btn" data-index="${idx}" style="background: #e63946; color: #fff; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer;">Remove</button>
                    </div>
                `;

                favItemsContainer.appendChild(row);
            });

            favItemsContainer.querySelectorAll(".move-to-cart").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const idx = Number(btn.getAttribute("data-index"));
                    const favs = getFavorites();
                    if (favs[idx]) {
                        addItemToCart(favs[idx]);
                        btn.textContent = "Added ✓";
                        setTimeout(function () {
                            btn.textContent = "Add to Cart";
                        }, 800);
                    }
                });
            });

            favItemsContainer.querySelectorAll(".remove-fav").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const idx = Number(btn.getAttribute("data-index"));
                    const favs = getFavorites();
                    favs.splice(idx, 1);
                    saveFavorites(favs);
                    renderFavorites();
                });
            });
        };

        if (clearFavBtn) {
            clearFavBtn.addEventListener("click", function () {
                saveFavorites([]);
                renderFavorites();
            });
        }

        renderFavorites();
    }

    // 8. عرض وإدارة المنتجات في صفحة السلة (cart.html)
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotal");
    const clearCartBtn = document.getElementById("clearCartBtn");

    if (cartItemsContainer) {
        const renderCart = function () {
            const cart = getCart();
            cartItemsContainer.innerHTML = "";

            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `<p style="text-align:center; padding: 30px; font-size: 18px;">Your cart is currently empty.</p>`;
                if (cartTotalEl) cartTotalEl.textContent = "$0";
                return;
            }

            let total = 0;

            cart.forEach(function (item, idx) {
                const itemSubtotal = item.price * item.quantity;
                total += itemSubtotal;

                const row = document.createElement("div");
                row.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 15px; border-bottom: 1px solid #eee; flex-wrap: wrap;";

                row.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${item.image}" alt="${item.name}" style="width: 75px; height: 90px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <h3 style="margin-bottom: 5px;">${item.name}</h3>
                            <p style="color: #666;">Price: $${item.price}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button type="button" class="qty-minus btn" data-index="${idx}" style="padding: 5px 12px; cursor: pointer;">-</button>
                        <span style="font-weight: bold; min-width: 24px; text-align: center;">${item.quantity}</span>
                        <button type="button" class="qty-plus btn" data-index="${idx}" style="padding: 5px 12px; cursor: pointer;">+</button>
                        <span style="font-weight: bold; margin: 0 10px;">$${itemSubtotal}</span>
                        <button type="button" class="remove-item btn" data-index="${idx}" style="background: #e63946; color: #fff; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer;">Remove</button>
                    </div>
                `;

                cartItemsContainer.appendChild(row);
            });

            if (cartTotalEl) {
                cartTotalEl.textContent = `$${total}`;
            }

            cartItemsContainer.querySelectorAll(".qty-plus").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const idx = Number(btn.getAttribute("data-index"));
                    const cart = getCart();
                    if (cart[idx]) {
                        cart[idx].quantity += 1;
                        saveCart(cart);
                        renderCart();
                    }
                });
            });

            cartItemsContainer.querySelectorAll(".qty-minus").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const idx = Number(btn.getAttribute("data-index"));
                    const cart = getCart();
                    if (cart[idx]) {
                        if (cart[idx].quantity > 1) {
                            cart[idx].quantity -= 1;
                        } else {
                            cart.splice(idx, 1);
                        }
                        saveCart(cart);
                        renderCart();
                    }
                });
            });

            cartItemsContainer.querySelectorAll(".remove-item").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    const idx = Number(btn.getAttribute("data-index"));
                    const cart = getCart();
                    cart.splice(idx, 1);
                    saveCart(cart);
                    renderCart();
                });
            });
        };

        if (clearCartBtn) {
            clearCartBtn.addEventListener("click", function () {
                saveCart([]);
                renderCart();
            });
        }

        renderCart();
    }
});