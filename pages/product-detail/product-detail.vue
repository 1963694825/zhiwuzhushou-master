<template>
	<view class="product-detail-page">
		<!-- 自定义导航栏 -->
		<custom-navbar :bgColor="navBgColor" :showBack="true">
			<view class="nav-title">商品详情 ({{ showSpec }})</view>
			<view slot="right" class="nav-actions">
				<uni-icons type="redo" size="20" color="#1e293b" @tap="shareProduct"></uni-icons>
			</view>
		</custom-navbar>

		<!-- 占位高度 -->
		<view :style="{ height: navBarHeight + 'px' }"></view>

		<!-- 页面内容 -->
		<scroll-view scroll-y class="detail-scroll" :style="{ height: scrollHeight }">
			<!-- 商品图片轮播 (1:1比例) -->
			<view class="product-images" @tap="previewImage(currentImageIndex)">
				<swiper class="swiper-container" :indicator-dots="true" :autoplay="true" :circular="true" @change="swiperChange">
					<swiper-item v-for="(img, index) in productImages" :key="index">
						<image :src="img" mode="aspectFill" class="product-image"></image>
					</swiper-item>
				</swiper>
				<view class="image-indicator">{{ currentImageIndex + 1 }}/{{ productImages.length }}</view>
			</view>

			<!-- 价格区域 -->
			<view class="price-section">
				<view class="price-row">
					<view class="price-box">
						<text class="currency">¥</text>
						<text class="price">{{ product.price }}</text>
						<text class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</text>
					</view>
					<view class="favorite-btn" @tap="toggleFavorite">
						<uni-icons :type="isFavorite ? 'star-filled' : 'star'" size="22" :color="isFavorite ? '#f59e0b' : '#64748b'"></uni-icons>
					</view>
				</view>
				<view class="sales-info">
					<text>已售{{ product.sales || 0 }}件</text>
				</view>
			</view>

			<!-- 商品标题 -->
			<view class="title-section">
				<view class="product-title">
					<text class="tag hot" v-if="product.isHot">热卖</text>
					<text class="tag new" v-if="product.isNew">新品</text>
					{{ product.name }}
				</view>
				<view class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</view>
			</view>

			<!-- 优惠活动 -->
			<view class="promotion-section" v-if="product.promotions && product.promotions.length">
				<view class="promotion-item" v-for="(promo, index) in product.promotions" :key="index">
					<text class="promo-tag">{{ promo.type }}</text>
					<text class="promo-desc">{{ promo.desc }}</text>
					<uni-icons type="right" size="14" color="#94a3b8"></uni-icons>
				</view>
			</view>

			<!-- 服务保障 -->
			<view class="service-section">
				<view class="service-item" v-for="(service, index) in services" :key="index">
					<uni-icons type="checkmarkempty" size="16" color="#22c55e"></uni-icons>
					<text>{{ service }}</text>
				</view>
			</view>

			<!-- 用户评价入口 -->
			<view class="review-entry" @tap="viewAllReviews">
				<view class="entry-header">
					<text class="entry-title">用户评价</text>
					<view class="rating-info">
						<text class="rating-score">{{ averageRating.toFixed(1) }}</text>
						<view class="rating-stars">
							<uni-icons v-for="i in 5" :key="i" 
								:type="i <= averageRating ? 'star-filled' : 'star'" 
								size="14" 
								color="#f59e0b">
							</uni-icons>
						</view>
						<text class="good-rate">好评率{{ goodRate }}%</text>
					</view>
				</view>

				<!-- 精选评论预览 -->
				<view class="review-preview">
					<view class="preview-item" v-for="review in previewReviews" :key="review.id">
						<view class="preview-header">
							<text class="user-name">{{ review.userName }}</text>
							<view class="preview-rating">
								<uni-icons v-for="i in 5" :key="i" 
									:type="i <= review.rating ? 'star-filled' : 'star'" 
									size="12" 
									color="#f59e0b">
								</uni-icons>
							</view>
						</view>
						<text class="preview-content">{{ review.content }}</text>
					</view>
				</view>

				<view class="view-all-btn">
					<text>查看全部{{ reviews.length }}条评价</text>
					<uni-icons type="right" size="14" color="#64748b"></uni-icons>
				</view>
			</view>

			<!-- 商品详情 -->
			<view class="detail-section">
				<view class="detail-header">
					<text class="detail-title">商品详情</text>
				</view>
				
				<!-- 详情图片 -->
				<view class="detail-images">
					<image 
						v-for="(img, index) in detailImages" 
						:key="index"
						:src="img" 
						mode="widthFix" 
						lazy-load
						class="detail-image"
					></image>
				</view>
			</view>

			<!-- 底部到底提示 -->
			<view class="bottom-tip">
				<text>已经到底了~</text>
			</view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-icons">
				<view class="icon-item" @tap="contactService">
					<uni-icons type="chat" size="24" color="#64748b"></uni-icons>
					<text class="icon-label">客服</text>
				</view>
				<view class="icon-item" @tap="goToShop">
					<uni-icons type="shop" size="24" color="#64748b"></uni-icons>
					<text class="icon-label">店铺</text>
				</view>
				<view class="icon-item" @tap="goToCart">
					<uni-icons type="cart" size="24" color="#64748b"></uni-icons>
					<text class="icon-label">购物车</text>
					<view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
				</view>
			</view>
			<view class="action-buttons">
				<view class="btn-add-cart" @tap="showSpecPopup('cart')">
					<text>加入购物车</text>
				</view>
				<view class="btn-buy-now" @tap="showSpecPopup('buy')">
					<text>立即购买</text>
				</view>
			</view>
		</view>

		<!-- 规格选择弹窗 -->
		<view class="spec-mask" v-if="showSpec === true" @tap.stop="closeSpecPopup">
			<view class="spec-popup" @tap.stop>
				<view class="popup-header">
					<image :src="product.image" mode="aspectFill" class="popup-image"></image>
					<view class="popup-info">
						<text class="popup-price">¥{{ product.price }}</text>
						<text class="popup-stock">库存{{ product.stock || 999 }}件</text>
						<text class="popup-selected">已选: {{ selectedSpecText }}</text>
					</view>
					<uni-icons type="closeempty" size="24" color="#64748b" @tap.stop="closeSpecPopup"></uni-icons>
				</view>

				<scroll-view scroll-y class="popup-scroll">
					<view class="popup-specs">
						<view class="spec-group">
							<text class="spec-title">规格</text>
							<view class="spec-options">
								<view 
									v-for="(spec, index) in product.specOptions" 
									:key="index"
									class="spec-option" 
									:class="{ active: selectedSpec === index }"
									@tap="selectSpec(index)">
									{{ spec }}
								</view>
							</view>
						</view>
					</view>

					<view class="popup-quantity">
						<text class="quantity-label">数量</text>
						<view class="quantity-control">
							<view class="quantity-btn" @tap="decreaseQuantity">
								<uni-icons type="minus" size="16" color="#64748b"></uni-icons>
							</view>
							<input type="number" :value="quantity" disabled class="quantity-input" />
							<view class="quantity-btn" @tap="increaseQuantity">
								<uni-icons type="plus" size="16" color="#64748b"></uni-icons>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="popup-footer">
					<view class="btn-confirm" @tap="confirmSpec">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			navBarHeight: 88,
			scrollHeight: '500px',
			navBgColor: '#FFFFFF',
			currentImageIndex: 0,
			isFavorite: false,
			cartCount: 0,
			actionType: 'cart', // 'cart' 或 'buy'
			selectedSpec: 0,
			quantity: 1,
			showSpec: false, // 显示规格弹窗
			
			product: {
				id: 1,
				name: '蝴蝶兰盆栽',
				subtitle: '精心培育 优雅绽放',
				price: 219.0,
				originalPrice: 299.0,
				sales: 1234,
				stock: 999,
				isHot: true,
				isNew: false,
				image: 'https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?w=400',
				specOptions: ['标准款', '豪华款', '礼盒装'],
				promotions: [
					{ type: '满减', desc: '满200减20' },
					{ type: '券', desc: '领券立减10元' }
				]
			},
			
			productImages: [],
			
			services: [
				'7天无理由退换',
				'正品保障',
				'48小时发货',
				'全国包邮'
			],
			
			reviews: [
				{
					id: 1,
					userName: '花***爱',
					rating: 5,
					content: '花很漂亮,包装很好,没有损坏,非常满意!'
				},
				{
					id: 2,
					userName: '绿***居',
					rating: 5,
					content: '质量很好,花朵新鲜,卖家服务态度也很好,值得购买!'
				},
				{
					id: 3,
					userName: '植***家',
					rating: 4,
					content: '整体不错,就是物流有点慢,不过花很好看。'
				}
			],
			
			detailImages: [
				'https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?w=800',
				'https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?w=800',
				'https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?w=800'
			]
		};
	},
	
	computed: {
		selectedSpecText() {
			return this.product.specOptions[this.selectedSpec] || '请选择规格';
		},
		
		previewReviews() {
			return this.reviews.slice(0, 2);
		},
		
		averageRating() {
			if (this.reviews.length === 0) return 5;
			const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
			return sum / this.reviews.length;
		},
		
		goodRate() {
			if (this.reviews.length === 0) return 100;
			const goodReviews = this.reviews.filter(r => r.rating >= 4).length;
			return Math.round((goodReviews / this.reviews.length) * 100);
		}
	},
	
	onLoad(options) {
		// 获取导航栏高度
		const systemInfo = uni.getSystemInfoSync();
		const statusBarHeight = systemInfo.statusBarHeight;
		// #ifdef MP-WEIXIN
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		this.navBarHeight = statusBarHeight + (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
		// #endif
		// #ifndef MP-WEIXIN
		this.navBarHeight = statusBarHeight + 44;
		// #endif

		this.scrollHeight = `calc(100vh - ${this.navBarHeight}px - 160rpx)`;

		// 获取商品ID并加载数据
		if (options.id) {
			this.loadProductDetail(options.id);
		}
		
		// 如果传递了完整商品数据
		if (options.product) {
			try {
				const productData = JSON.parse(decodeURIComponent(options.product));
				this.product = { ...this.product, ...productData };
			} catch (e) {
				console.error('解析商品数据失败:', e);
			}
		}
		
		this.productImages = [
			this.product.image,
			this.product.image,
			this.product.image
		];
		
		// 加载购物车数量
		this.loadCartCount();
		
		// 确保弹窗初始为关闭状态
		this.showSpec = false;
		console.log('页面加载完成, showSpec:', this.showSpec);
	},
	
	methods: {
		loadProductDetail(id) {
			// TODO: 从服务器加载商品详情
			console.log('加载商品详情:', id);
		},
		
		loadCartCount() {
			this.cartCount = uni.getStorageSync('cartCount') || 0;
		},
		
		swiperChange(e) {
			this.currentImageIndex = e.detail.current;
		},
		
		previewImage(index) {
			uni.previewImage({
				current: index,
				urls: this.productImages
			});
		},
		
		toggleFavorite() {
			this.isFavorite = !this.isFavorite;
			uni.showToast({
				title: this.isFavorite ? '收藏成功' : '取消收藏',
				icon: 'success'
			});
		},
		
		shareProduct() {
			uni.showShareMenu({
				title: this.product.name,
				path: `/pages/product-detail/product-detail?id=${this.product.id}`
			});
		},
		
		showSpecPopup(type) {
		console.log('showSpecPopup called, type:', type);
		this.actionType = type;
		this.showSpec = true;
		console.log('showSpec set to:', this.showSpec);
	},
		
	closeSpecPopup() {
		console.log('closeSpecPopup called');
		this.showSpec = false;
		console.log('showSpec set to:', this.showSpec);
	},
		
		selectSpec(index) {
			this.selectedSpec = index;
		},
		
		decreaseQuantity() {
			if (this.quantity > 1) {
				this.quantity--;
			}
		},
		
		increaseQuantity() {
			if (this.quantity < this.product.stock) {
				this.quantity++;
			}
		},
		
		confirmSpec() {
			if (this.actionType === 'cart') {
				this.addToCart();
			} else {
				this.buyNow();
			}
			this.closeSpecPopup();
		},
		
		addToCart() {
			this.cartCount++;
			uni.setStorageSync('cartCount', this.cartCount);
			uni.showToast({
				title: '已加入购物车',
				icon: 'success'
			});
		},
		
		buyNow() {
			uni.showToast({
				title: '立即购买功能开发中',
				icon: 'none'
			});
		},
		
		contactService() {
			uni.showToast({
				title: '连接客服中...',
				icon: 'none'
			});
		},
		
		goToShop() {
			uni.navigateTo({
				url: '/pages/shop/shop'
			});
		},
		
		goToCart() {
			uni.showToast({
				title: '购物车功能开发中',
				icon: 'none'
			});
		},
		
		viewAllReviews() {
			uni.showToast({
				title: '查看全部评价功能开发中',
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.product-detail-page {
	min-height: 100vh;
	background-color: #f9fafb;

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
	}

	.nav-actions {
		display: flex;
		align-items: center;
	}

	.detail-scroll {
		// 商品图片轮播
		.product-images {
			width: 100%;
			background-color: #ffffff;
			position: relative;

			.swiper-container {
				width: 100%;
				height: 750rpx; // 1:1比例

				.product-image {
					width: 100%;
					height: 100%;
				}
			}

			.image-indicator {
				position: absolute;
				bottom: 20rpx;
				right: 20rpx;
				background-color: rgba(0, 0, 0, 0.5);
				color: #ffffff;
				font-size: 22rpx;
				padding: 6rpx 16rpx;
				border-radius: 20rpx;
			}
		}

		// 价格区域
		.price-section {
			background-color: #ffffff;
			padding: 30rpx 40rpx;
			margin-bottom: 20rpx;

			.price-row {
				display: flex;
				align-items: baseline;
				justify-content: space-between;
				margin-bottom: 20rpx;

				.price-box {
					display: flex;
					align-items: baseline;

					.currency {
						font-size: 36rpx;
						color: #ef4444;
						font-weight: 600;
					}

					.price {
						font-size: 64rpx;
						color: #ef4444;
						font-weight: 800;
						margin: 0 8rpx;
					}

					.original-price {
						font-size: 26rpx;
						color: #94a3b8;
						text-decoration: line-through;
					}
				}

				.favorite-btn {
					padding: 8rpx;
				}
			}

			.sales-info {
				text {
					font-size: 24rpx;
					color: #64748b;
				}
			}
		}

		// 商品标题
		.title-section {
			background-color: #ffffff;
			padding: 30rpx 40rpx;
			margin-bottom: 20rpx;

			.product-title {
				font-size: 36rpx;
				font-weight: 700;
				line-height: 1.5;
				color: #1e293b;
				margin-bottom: 16rpx;

				.tag {
					display: inline-block;
					font-size: 20rpx;
					padding: 4rpx 12rpx;
					border-radius: 6rpx;
					margin-right: 8rpx;
					vertical-align: middle;
					font-weight: 600;

					&.hot {
						background: linear-gradient(135deg, #ef4444, #dc2626);
						color: #ffffff;
					}

					&.new {
						background: linear-gradient(135deg, #22c55e, #16a34a);
						color: #ffffff;
					}
				}
			}

			.product-subtitle {
				font-size: 26rpx;
				color: #64748b;
				line-height: 1.6;
			}
		}

		// 优惠活动
		.promotion-section {
			background-color: #ffffff;
			padding: 20rpx 40rpx;
			margin-bottom: 20rpx;

			.promotion-item {
				display: flex;
				align-items: center;
				padding: 16rpx 0;
				border-bottom: 1rpx solid #f1f5f9;

				&:last-child {
					border-bottom: none;
				}

				.promo-tag {
					background: linear-gradient(135deg, #ef4444, #dc2626);
					color: #ffffff;
					font-size: 20rpx;
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
					margin-right: 16rpx;
					flex-shrink: 0;
				}

				.promo-desc {
					flex: 1;
					font-size: 26rpx;
					color: #64748b;
				}
			}
		}

		// 服务保障
		.service-section {
			background-color: #ffffff;
			padding: 30rpx 40rpx;
			margin-bottom: 20rpx;
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 20rpx;

			.service-item {
				display: flex;
				align-items: center;
				gap: 8rpx;
				font-size: 24rpx;
				color: #64748b;
			}
		}

		// 用户评价入口
		.review-entry {
			background-color: #ffffff;
			padding: 30rpx 40rpx;
			margin-bottom: 20rpx;

			.entry-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 24rpx;

				.entry-title {
					font-size: 30rpx;
					font-weight: 600;
					color: #1e293b;
				}

				.rating-info {
					display: flex;
					align-items: center;
					gap: 12rpx;

					.rating-score {
						font-size: 32rpx;
						font-weight: 700;
						color: #f59e0b;
					}

					.rating-stars {
						display: flex;
						gap: 4rpx;
					}

					.good-rate {
						font-size: 22rpx;
						color: #64748b;
					}
				}
			}

			.review-preview {
				margin-bottom: 24rpx;

				.preview-item {
					padding: 20rpx 0;
					border-bottom: 1rpx solid #f1f5f9;

					&:last-child {
						border-bottom: none;
					}

					.preview-header {
						display: flex;
						align-items: center;
						justify-content: space-between;
						margin-bottom: 12rpx;

						.user-name {
							font-size: 24rpx;
							color: #64748b;
						}

						.preview-rating {
							display: flex;
							gap: 4rpx;
						}
					}

					.preview-content {
						font-size: 26rpx;
						color: #475569;
						line-height: 1.6;
						display: block;
					}
				}
			}

			.view-all-btn {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				padding: 16rpx 0;
				border-top: 1rpx solid #f1f5f9;

				text {
					font-size: 26rpx;
					color: #64748b;
				}
			}
		}

		// 商品详情
		.detail-section {
			background-color: #ffffff;
			padding: 30rpx 0;

			.detail-header {
				padding: 0 40rpx 24rpx;

				.detail-title {
					font-size: 30rpx;
					font-weight: 600;
					color: #1e293b;
				}
			}

			.detail-images {
				.detail-image {
					width: 100%;
					display: block;
				}
			}
		}

		// 底部到底提示
		.bottom-tip {
			padding: 60rpx 0;
			text-align: center;

			text {
				font-size: 24rpx;
				color: #94a3b8;
			}
		}
	}

	// 规格选择弹窗遮罩
	.spec-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	// 底部操作栏
	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		padding: 20rpx 40rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 100;

		.action-icons {
			display: flex;
			gap: 40rpx;
			margin-right: 40rpx;

			.icon-item {
				position: relative;
				display: flex;
				flex-direction: column;
				align-items: center;

				.icon-label {
					font-size: 20rpx;
					color: #64748b;
					margin-top: 4rpx;
				}

				.cart-badge {
					position: absolute;
					top: -8rpx;
					right: -8rpx;
					background-color: #ef4444;
					color: #ffffff;
					font-size: 18rpx;
					min-width: 28rpx;
					height: 28rpx;
					padding: 0 6rpx;
					border-radius: 14rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}

		.action-buttons {
			flex: 1;
			display: flex;
			gap: 20rpx;

			.btn-add-cart,
			.btn-buy-now {
				flex: 1;
				height: 80rpx;
				border-radius: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				text {
					font-size: 28rpx;
					color: #ffffff;
					font-weight: 600;
				}
			}

			.btn-add-cart {
				background: linear-gradient(135deg, #fbbf24, #f59e0b);
			}

			.btn-buy-now {
				background: linear-gradient(135deg, #22c55e, #16a34a);
			}
		}
	}

	// 规格选择弹窗
	.spec-popup {
		width: 100%;
		background-color: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		max-height: 80vh;
		display: flex;
		flex-direction: column;

		.popup-header {
			display: flex;
			align-items: flex-start;
			padding: 40rpx;
			border-bottom: 1rpx solid #f1f5f9;

			.popup-image {
				width: 160rpx;
				height: 160rpx;
				border-radius: 16rpx;
				margin-right: 24rpx;
				flex-shrink: 0;
			}

			.popup-info {
				flex: 1;

				.popup-price {
					font-size: 48rpx;
					color: #ef4444;
					font-weight: 800;
					display: block;
					margin-bottom: 12rpx;
				}

				.popup-stock {
					font-size: 24rpx;
					color: #64748b;
					display: block;
					margin-bottom: 8rpx;
				}

				.popup-selected {
					font-size: 24rpx;
					color: #64748b;
					display: block;
				}
			}
		}

		.popup-scroll {
			flex: 1;
			overflow-y: auto;

			.popup-specs {
				padding: 40rpx;

				.spec-group {
					.spec-title {
						font-size: 28rpx;
						color: #1e293b;
						font-weight: 600;
						display: block;
						margin-bottom: 24rpx;
					}

					.spec-options {
						display: flex;
						flex-wrap: wrap;
						gap: 20rpx;

						.spec-option {
							padding: 16rpx 40rpx;
							background-color: #f3f4f6;
							border-radius: 12rpx;
							font-size: 26rpx;
							color: #64748b;
							border: 2rpx solid transparent;
							transition: all 0.3s;

							&.active {
								background-color: #f0fdf4;
								color: #16a34a;
								border-color: #16a34a;
								font-weight: 600;
							}
						}
					}
				}
			}

			.popup-quantity {
				padding: 0 40rpx 40rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.quantity-label {
					font-size: 28rpx;
					color: #1e293b;
					font-weight: 600;
				}

				.quantity-control {
					display: flex;
					align-items: center;
					gap: 20rpx;

					.quantity-btn {
						width: 60rpx;
						height: 60rpx;
						border: 1rpx solid #e5e7eb;
						border-radius: 12rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						background-color: #f8f9fa;
					}

					.quantity-input {
						width: 100rpx;
						height: 60rpx;
						text-align: center;
						font-size: 28rpx;
						color: #1e293b;
						border: 1rpx solid #e5e7eb;
						border-radius: 12rpx;
					}
				}
			}
		}

		.popup-footer {
			padding: 20rpx 40rpx;
			border-top: 1rpx solid #f1f5f9;

			.btn-confirm {
				width: 100%;
				height: 80rpx;
				background: linear-gradient(135deg, #22c55e, #16a34a);
				border-radius: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				color: #ffffff;
				font-weight: 600;
			}
		}
	}
}
</style>
