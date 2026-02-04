<template>
	<view class="shop-page">
		<!-- 头部固定布局：导航栏 + 分类标签 -->
		<view class="header-fixed-box">
			<custom-navbar bgColor="#FFFFFF">
				<view class="search-flex-container">
					<view class="search-input-field">
						<uni-icons type="search" size="16" color="#999"></uni-icons>
						<input type="text" placeholder="请输入商品名称" class="search-input-core" />
					</view>
				</view>
			</custom-navbar>
			
			<!-- 为吸顶的导航栏预留占位高度，确保下方的标签栏可见 -->
			<view :style="{ height: navBarHeight + 'px' }"></view>
			
			<!-- 分类标签栏 (即截图红线标注的缺失部分) -->
			<view class="top-category-tags">
				<scroll-view scroll-x class="tag-scroller-view" :show-scrollbar="false">
					<view class="tag-node-item active">全部商品</view>
					<view class="tag-node-item">超黑光</view>
					<view class="tag-node-item">电商专用</view>
					<view class="tag-more-arrow">
						<uni-icons type="bottom" size="14" color="#666"></uni-icons>
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 页面内容整体位移占位，确保不被固定头部遮挡 -->
		<view :style="{ height: (navBarHeight + 45) + 'px' }"></view>

		<!-- 局部滚动主体 -->
		<view class="main-split-container" :style="{ height: scrollAreaHeight }">
			<!-- 左侧侧边导航 -->
			<scroll-view scroll-y class="side-menu-scroller">
				<view 
					class="menu-item-unit" 
					v-for="(item, index) in menuCategories" 
					:key="index"
					:class="{ active: activeSideMenu === item }"
					@tap="activeSideMenu = item"
				>
					<text class="menu-label-text">{{ item }}</text>
				</view>
				<view class="safe-area-bottom-filler"></view>
			</scroll-view>

			<!-- 右侧商品区域 -->
			<scroll-view scroll-y class="right-product-scroller">
				<view class="products-stack">
					<view class="product-entry-card" v-for="(item, index) in productDataList" :key="index">
						<image :src="item.image" mode="aspectFill" class="card-thumb-image"></image>
						<view class="card-detail-info">
							<view class="info-top-layout">
								<view class="brand-badge-wrap">
									<text class="brand-badge-label">{{ item.brand }}</text>
								</view>
								<text class="product-name-title">{{ item.name }}</text>
								<text class="product-specs-label">{{ item.specs }}</text>
							</view>
							<view class="info-bottom-layout">
								<view class="price-display-box">
									<text class="price-currency-unit">¥</text>
									<text class="price-value-text">{{ item.price.toFixed(2) }}</text>
								</view>
								<view class="cart-btn-round">
									<uni-icons type="cart-filled" size="18" color="#FFFFFF"></uni-icons>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="safe-area-bottom-filler"></view>
			</scroll-view>
		</view>

		<!-- 底部 TabBar -->
		<custom-tabbar currentPath="pages/shop/shop"></custom-tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 88,
				activeSideMenu: '分销摄像机',
				menuCategories: [
					"分销摄像机", "分销球机", "分销NVR", "工具/辅材", 
					"显示产品", "操作系统", "交换机", "解码/处理器"
				],
				productDataList: [
					{
						id: 1,
						name: "蝴蝶兰盆栽",
						brand: "天地伟业",
						specs: "TC-C13DU 配置:W/E/Y/4...",
						price: 219.0,
						image: "https://images.unsplash.com/photo-1694903734775-d7fb295f4e00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmNoaWQlMjBmbG93ZXIlMjBpbmRvb3IlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					},
					{
						id: 2,
						name: "多肉组合盆栽",
						brand: "天地伟业",
						specs: "TC-C15DU 配置:W/Y/6m...",
						price: 348.0,
						image: "https://images.unsplash.com/photo-1763784436630-629fd9a4e0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBjYWN0dXMlMjBwb3R0ZWQlMjBwbGFudHxlbnwxfHx8fDE3NzAwMDQ4MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					},
					{
						id: 3,
						name: "室内绿植套装",
						brand: "天地伟业",
						specs: "TC-C13DU 配置:W/Y/4m...",
						price: 200.0,
						image: "https://images.unsplash.com/photo-1651807193045-1b366e7f347f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFudCUyMGZlcnRpbGl6ZXIlMjBwb3R8ZW58MXx8fHwxNzcwMDA0ODE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					},
					{
						id: 4,
						name: "养护工具套装",
						brand: "天地伟业",
						specs: "TC-C15DU 配置:W/E/Y/4...",
						price: 368.0,
						image: "https://images.unsplash.com/photo-1759422714268-0805b53525b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvb3IlMjBwbGFudCUyMGNhcmUlMjBndWlkZXxlbnwxfHx8fDE3NzAwMDQ4MTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					}
				]
			};
		},
		computed: {
			scrollAreaHeight() {
				// 100vh - 头部高度 - 底部TabBar高度
				return `calc(100vh - ${this.navBarHeight}px - 45px - 100rpx - env(safe-area-inset-bottom))`;
			}
		},
		onLoad() {
			const res = uni.getSystemInfoSync();
			const statusH = res.statusBarHeight;
			// #ifdef MP-WEIXIN
			const capsuleBounds = uni.getMenuButtonBoundingClientRect();
			this.navBarHeight = statusH + (capsuleBounds.top - statusH) * 2 + capsuleBounds.height;
			// #endif
			// #ifndef MP-WEIXIN
			this.navBarHeight = statusH + 44;
			// #endif
		}
	}
</script>

<style lang="scss" scoped>
	.shop-page {
		height: 100vh;
		background-color: #f9fafb;
		display: flex;
		flex-direction: column;
		overflow: hidden;

		.header-fixed-box {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			background-color: #ffffff;
			z-index: 1001;

			.search-flex-container {
				flex: 1;
				display: flex;
				align-items: center;
				margin-right: 220rpx;

				.search-input-field {
					flex: 1;
					height: 72rpx;
					background-color: #f3f4f6;
					border-radius: 36rpx;
					display: flex;
					align-items: center;
					padding-left: 24rpx;

					.search-input-core {
						flex: 1;
						font-size: 26rpx;
						margin-left: 12rpx;
						color: #333;
					}
				}

				.layout-toggle-icon {
					padding: 0 20rpx;
					.grid-icons {
						display: grid;
						grid-template-columns: repeat(2, 1fr);
						gap: 4rpx;
						.dot {
							width: 14rpx;
							height: 14rpx;
							background-color: #cbd5e1;
							border-radius: 4rpx;
						}
					}
				}
			}

			.top-category-tags {
				height: 90rpx;
				padding: 0 30rpx;
				display: flex;
				align-items: center;
				border-bottom: 1rpx solid #f1f5f9;

				.tag-scroller-view {
					white-space: nowrap;
					.tag-node-item {
						display: inline-block;
						padding: 8rpx 32rpx;
						font-size: 26rpx;
						color: #64748b;
						border-radius: 30rpx;
						margin-right: 16rpx;

						&.active {
							background-color: #f0fdf4;
							color: #16a34a;
							font-weight: 600;
							border: 1rpx solid #dcfce7;
						}
					}
					.tag-more-arrow {
						display: inline-block;
						padding-left: 10rpx;
						vertical-align: middle;
					}
				}
			}
		}

		.main-split-container {
			display: flex;
			overflow: hidden;

			.side-menu-scroller {
				width: 180rpx;
				height: 100%;
				background-color: #ffffff;
				border-right: 1rpx solid #f1f5f9;

				.menu-item-unit {
					padding: 40rpx 20rpx;
					text-align: center;
					position: relative;

					.menu-label-text {
						font-size: 24rpx;
						color: #64748b;
					}

					&.active {
						background-color: #f9fafb;
						.menu-label-text {
							color: #16a34a;
							font-weight: 600;
						}
						&::before {
							content: '';
							position: absolute;
							left: 0;
							top: 30%;
							height: 40%;
							width: 8rpx;
							background-color: #16a34a;
							border-radius: 0 4rpx 4rpx 0;
						}
					}
				}
			}

			.right-product-scroller {
				flex: 1;
				height: 100%;
				padding: 24rpx;

				.products-stack {
					.product-entry-card {
						background-color: #ffffff;
						border-radius: 24rpx;
						padding: 24rpx;
						display: flex;
						gap: 24rpx;
						margin-bottom: 24rpx;
						box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.03);

						.card-thumb-image {
							width: 160rpx;
							height: 160rpx;
							border-radius: 20rpx;
							flex-shrink: 0;
						}

						.card-detail-info {
							flex: 1;
							display: flex;
							flex-direction: column;
							justify-content: space-between;

							.brand-badge-label {
								background-color: #f0fdf4;
								color: #16a34a;
								font-size: 20rpx;
								padding: 2rpx 12rpx;
								border-radius: 8rpx;
							}

							.product-name-title {
								font-size: 28rpx;
								font-weight: 700;
								color: #1e293b;
								display: block;
								margin: 8rpx 0 4rpx;
							}

							.product-specs-label {
								font-size: 22rpx;
								color: #94a3b8;
								display: block;
							}

							.info-bottom-layout {
								display: flex;
								align-items: center;
								justify-content: space-between;
								margin-top: 10rpx;

								.price-display-box {
									color: #ef4444;
									.price-currency-unit { font-size: 24rpx; font-weight: 600; }
									.price-value-text { font-size: 40rpx; font-weight: 800; }
								}

								.cart-btn-round {
									width: 60rpx;
									height: 60rpx;
									background: linear-gradient(135deg, #22c55e, #16a34a);
									border-radius: 30rpx;
									display: flex;
									align-items: center;
									justify-content: center;
									box-shadow: 0 4rpx 12rpx rgba(22, 163, 74, 0.3);
								}
							}
						}
					}
				}
			}
		}

		.safe-area-bottom-filler {
			height: 40rpx;
		}
	}
</style>
