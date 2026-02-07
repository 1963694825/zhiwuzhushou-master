<template>
	<view class="orders-page">
		<!-- 自定义导航栏 -->
		<custom-navbar :bgColor="'#FFFFFF'" :showBack="true">
			<view class="nav-title">我的订单</view>
		</custom-navbar>

		<!-- 占位高度 -->
		<view :style="{ height: navBarHeight + 'px' }"></view>

		<!-- Tab切换 -->
		<scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
			<view class="tabs-container">
				<view 
					class="tab-item" 
					v-for="(tab, index) in tabs" 
					:key="index"
					:class="{ active: activeTab === index }"
					@tap="switchTab(index)">
					<text class="tab-label">{{ tab.label }}</text>
					<view class="badge" v-if="tab.count > 0">{{ tab.count }}</view>
				</view>
			</view>
		</scroll-view>

		<!-- 订单列表 -->
		<scroll-view 
			scroll-y 
			class="orders-scroll"
			:style="{ height: scrollHeight }"
			@scrolltolower="loadMore"
			refresher-enabled
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh">
			
			<view class="orders-list" v-if="displayOrders.length > 0">
				<view class="order-card" v-for="order in displayOrders" :key="order.id" @tap="goToDetail(order)">
					<!-- 订单头部 -->
					<view class="order-header">
						<view class="shop-info">
							<uni-icons type="shop" size="16" color="#1e293b"></uni-icons>
							<text class="shop-name">{{ order.shopName }}</text>
						</view>
						<view class="status-tag" :style="{ color: getStatusColor(order.status) }">
							{{ order.statusText }}
						</view>
					</view>

					<!-- 商品列表 -->
					<view class="products-section">
						<view class="product-item" v-for="(product, pIndex) in order.products" :key="pIndex">
							<image :src="product.image" mode="aspectFill" class="product-image"></image>
							<view class="product-info">
								<text class="product-name">{{ product.name }}</text>
								<text class="product-specs">{{ product.specs }}</text>
								<view class="product-bottom">
									<text class="product-price">¥{{ product.price.toFixed(2) }}</text>
									<text class="product-quantity">x{{ product.quantity }}</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 订单金额 -->
					<view class="order-amount">
						<text class="amount-label">共{{ getTotalQuantity(order) }}件商品</text>
						<text class="amount-text">实付:</text>
						<text class="amount-value">¥{{ order.actualAmount.toFixed(2) }}</text>
					</view>

					<!-- 操作按钮 -->
					<view class="order-actions" @tap.stop="">
						<view class="action-buttons">
							<!-- 待付款 -->
							<template v-if="order.status === 0">
								<view class="btn btn-default" @tap="cancelOrder(order)">取消订单</view>
								<view class="btn btn-primary" @tap="payOrder(order)">去支付</view>
							</template>
							
							<!-- 待发货 -->
							<template v-else-if="order.status === 1">
								<view class="btn btn-default" @tap="applyRefund(order)">申请退款</view>
								<view class="btn btn-default" @tap="remindShip(order)">提醒发货</view>
							</template>
							
							<!-- 待收货 -->
							<template v-else-if="order.status === 2">
								<view class="btn btn-default" @tap="viewLogistics(order)">查看物流</view>
								<view class="btn btn-primary" @tap="confirmReceive(order)">确认收货</view>
							</template>
							
							<!-- 待评价 -->
							<template v-else-if="order.status === 3">
								<view class="btn btn-default" @tap="goToDetail(order)">查看详情</view>
								<view class="btn btn-warning" @tap="evaluate(order)">去评价</view>
							</template>
							
							<!-- 已完成 -->
							<template v-else-if="order.status === 4">
								<view class="btn btn-default" @tap="deleteOrder(order)">删除订单</view>
								<view class="btn btn-default" @tap="buyAgain(order)">再次购买</view>
							</template>
							
							<!-- 已取消/已关闭 -->
							<template v-else-if="order.status === 5 || order.status === 10">
								<view class="btn btn-default" @tap="deleteOrder(order)">删除订单</view>
							</template>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<image src="https://images.unsplash.com/photo-1651807193045-1b366e7f347f?w=300" mode="aspectFit" class="empty-image"></image>
				<text class="empty-text">{{ getEmptyText() }}</text>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="displayOrders.length > 0 && hasMore">
				<text class="load-text">加载更多...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import orderManager from '@/utils/orderManager.js';

export default {
	data() {
		return {
			navBarHeight: 88,
			activeTab: 0,
			tabs: [
				{ label: '全部', status: -1, count: 0 },
				{ label: '待付款', status: 0, count: 0 },
				{ label: '待发货', status: 1, count: 0 },
				{ label: '待收货', status: 2, count: 0 },
				{ label: '待评价', status: 3, count: 0 },
				{ label: '退款/售后', status: 6, count: 0 }
			],
			allOrders: [],
			displayOrders: [],
			page: 1,
			pageSize: 20,
			hasMore: true,
			refreshing: false,
			scrollHeight: '500px'
		};
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

		// 计算滚动区域高度
		this.scrollHeight = `calc(100vh - ${this.navBarHeight}px - 100rpx)`;

		// 获取传入的状态参数
		if (options.status !== undefined) {
			const status = parseInt(options.status);
			const tabIndex = this.tabs.findIndex(t => t.status === status);
			if (tabIndex > -1) {
				this.activeTab = tabIndex;
			}
		}

		// 初始化数据
		this.initData();
	},
	methods: {
		initData() {
			// 初始化模拟数据(仅第一次)
			let orders = orderManager.getOrders();
			if (orders.length === 0) {
				orderManager.initMockData();
			}
			
			this.loadOrders();
			this.updateTabCounts();
		},

		loadOrders() {
			const currentStatus = this.tabs[this.activeTab].status;
			this.allOrders = orderManager.getOrders(currentStatus);
			this.page = 1;
			this.displayOrders = this.allOrders.slice(0, this.pageSize);
			this.hasMore = this.allOrders.length > this.pageSize;
		},

		loadMore() {
			if (!this.hasMore) return;
			
			const start = this.page * this.pageSize;
			const end = start + this.pageSize;
			const newOrders = this.allOrders.slice(start, end);
			
			if (newOrders.length > 0) {
				this.displayOrders.push(...newOrders);
				this.page++;
				this.hasMore = end < this.allOrders.length;
			} else {
				this.hasMore = false;
			}
		},

		switchTab(index) {
			this.activeTab = index;
			this.loadOrders();
		},

		updateTabCounts() {
			const stats = orderManager.getOrderStats();
			this.tabs[1].count = stats.unpaid;
			this.tabs[2].count = stats.paid;
			this.tabs[3].count = stats.shipped;
			this.tabs[4].count = stats.received;
			this.tabs[5].count = stats.refunding;
		},

		onRefresh() {
			this.refreshing = true;
			setTimeout(() => {
				this.loadOrders();
				this.updateTabCounts();
				this.refreshing = false;
				uni.showToast({ title: '刷新成功', icon: 'success' });
			}, 1000);
		},

		getTotalQuantity(order) {
			return order.products.reduce((sum, p) => sum + p.quantity, 0);
		},

		getStatusColor(status) {
			return orderManager.getStatusColor(status);
		},

		getEmptyText() {
			const emptyTexts = {
				0: '暂无订单',
				1: '暂无待付款订单',
				2: '暂无待发货订单',
				3: '暂无待收货订单',
				4: '暂无待评价订单',
				5: '暂无退款/售后订单'
			};
			return emptyTexts[this.activeTab] || '暂无订单';
		},

		goToDetail(order) {
			uni.navigateTo({
				url: `/pages/order-detail/order-detail?id=${order.id}`
			});
		},

		// 取消订单
		cancelOrder(order) {
			uni.showModal({
				title: '确认取消',
				content: '确定要取消该订单吗?',
				success: (res) => {
					if (res.confirm) {
						orderManager.updateOrderStatus(order.id, 5, { closeTime: new Date().toLocaleString() });
						this.loadOrders();
						this.updateTabCounts();
						uni.showToast({ title: '订单已取消', icon: 'success' });
					}
				}
			});
		},

		// 去支付
		payOrder(order) {
			uni.showModal({
				title: '支付确认',
				content: `确认支付¥${order.actualAmount.toFixed(2)}?`,
				success: (res) => {
					if (res.confirm) {
						orderManager.updateOrderStatus(order.id, 1, { 
							payTime: new Date().toLocaleString() 
						});
						this.loadOrders();
						this.updateTabCounts();
						uni.showToast({ title: '支付成功', icon: 'success' });
					}
				}
			});
		},

		// 确认收货
		confirmReceive(order) {
			uni.showModal({
				title: '确认收货',
				content: '确认已收到商品吗?',
				success: (res) => {
					if (res.confirm) {
						orderManager.updateOrderStatus(order.id, 3, { 
							receiveTime: new Date().toLocaleString() 
						});
						this.loadOrders();
						this.updateTabCounts();
						uni.showToast({ title: '确认收货成功', icon: 'success' });
					}
				}
			});
		},

		// 删除订单
		deleteOrder(order) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除该订单吗?',
				success: (res) => {
					if (res.confirm) {
						orderManager.deleteOrder(order.id);
						this.loadOrders();
						this.updateTabCounts();
						uni.showToast({ title: '订单已删除', icon: 'success' });
					}
				}
			});
		},

		// 申请退款
		applyRefund(order) {
			uni.showToast({ title: '退款功能开发中', icon: 'none' });
		},

		// 提醒发货
		remindShip(order) {
			uni.showToast({ title: '已提醒商家发货', icon: 'success' });
		},

		// 查看物流
		viewLogistics(order) {
			uni.showToast({ title: '物流追踪功能开发中', icon: 'none' });
		},

		// 去评价
		evaluate(order) {
			uni.showToast({ title: '评价功能开发中', icon: 'none' });
		},

		// 再次购买
		buyAgain(order) {
			uni.showToast({ title: '再次购买功能开发中', icon: 'none' });
		}
	}
}
</script>

<style lang="scss" scoped>
.orders-page {
	min-height: 100vh;
	background-color: #f9fafb;

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
	}

	.tabs-scroll {
		background-color: #ffffff;
		border-bottom: 1rpx solid #f1f5f9;

		.tabs-container {
			display: flex;
			white-space: nowrap;
			padding: 0 30rpx;

			.tab-item {
				position: relative;
				padding: 30rpx 24rpx;
				margin-right: 40rpx;
				display: inline-flex;
				align-items: center;

				.tab-label {
					font-size: 28rpx;
					color: #64748b;
					transition: all 0.3s;
				}

				.badge {
					position: absolute;
					top: 20rpx;
					right: -10rpx;
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

				&.active {
					.tab-label {
						color: #22c55e;
						font-weight: 600;
					}

					&::after {
						content: '';
						position: absolute;
						bottom: 0;
						left: 50%;
						transform: translateX(-50%);
						width: 40rpx;
						height: 6rpx;
						background-color: #22c55e;
						border-radius: 3rpx;
					}
				}
			}
		}
	}

	.orders-scroll {
		.orders-list {
			padding: 20rpx 30rpx;

			.order-card {
				background-color: #ffffff;
				border-radius: 24rpx;
				margin-bottom: 20rpx;
				overflow: hidden;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

				.order-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 24rpx 30rpx;
					border-bottom: 1rpx solid #f1f5f9;

					.shop-info {
						display: flex;
						align-items: center;
						gap: 12rpx;

						.shop-name {
							font-size: 26rpx;
							color: #1e293b;
							font-weight: 600;
						}
					}

					.status-tag {
						font-size: 24rpx;
						font-weight: 600;
					}
				}

				.products-section {
					.product-item {
						display: flex;
						padding: 24rpx 30rpx;
						gap: 20rpx;

						.product-image {
							width: 160rpx;
							height: 160rpx;
							border-radius: 16rpx;
							flex-shrink: 0;
						}

						.product-info {
							flex: 1;
							display: flex;
							flex-direction: column;

							.product-name {
								font-size: 28rpx;
								color: #1e293b;
								font-weight: 500;
								margin-bottom: 8rpx;
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-line-clamp: 2;
								-webkit-box-orient: vertical;
							}

							.product-specs {
								font-size: 22rpx;
								color: #94a3b8;
								margin-bottom: auto;
							}

							.product-bottom {
								display: flex;
								align-items: center;
								justify-content: space-between;

								.product-price {
									font-size: 32rpx;
									color: #ef4444;
									font-weight: 700;
								}

								.product-quantity {
									font-size: 24rpx;
									color: #64748b;
								}
							}
						}
					}
				}

				.order-amount {
					display: flex;
					align-items: center;
					justify-content: flex-end;
					padding: 20rpx 30rpx;
					border-top: 1rpx solid #f1f5f9;
					gap: 12rpx;

					.amount-label {
						font-size: 24rpx;
						color: #64748b;
						margin-right: auto;
					}

					.amount-text {
						font-size: 24rpx;
						color: #64748b;
					}

					.amount-value {
						font-size: 32rpx;
						color: #ef4444;
						font-weight: 700;
					}
				}

				.order-actions {
					padding: 20rpx 30rpx;
					border-top: 1rpx solid #f1f5f9;

					.action-buttons {
						display: flex;
						justify-content: flex-end;
						gap: 20rpx;

						.btn {
							padding: 12rpx 32rpx;
							border-radius: 40rpx;
							font-size: 24rpx;
							border: 1rpx solid #e5e7eb;
							transition: all 0.3s;

							&.btn-default {
								background-color: #ffffff;
								color: #64748b;
								border-color: #e5e7eb;
							}

							&.btn-primary {
								background: linear-gradient(135deg, #22c55e, #16a34a);
								color: #ffffff;
								border-color: transparent;
							}

							&.btn-warning {
								background: linear-gradient(135deg, #f97316, #ea580c);
								color: #ffffff;
								border-color: transparent;
							}

							&:active {
								transform: scale(0.95);
							}
						}
					}
				}
			}
		}

		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 120rpx 60rpx;

			.empty-image {
				width: 400rpx;
				height: 300rpx;
				margin-bottom: 40rpx;
				opacity: 0.6;
			}

			.empty-text {
				font-size: 28rpx;
				color: #94a3b8;
			}
		}

		.load-more {
			padding: 40rpx;
			text-align: center;

			.load-text {
				font-size: 24rpx;
				color: #94a3b8;
			}
		}
	}
}
</style>
