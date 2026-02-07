<template>
	<view class="order-detail-page">
		<!-- 自定义导航栏 -->
		<custom-navbar :bgColor="'#FFFFFF'" :showBack="true">
			<view class="nav-title">订单详情</view>
		</custom-navbar>

		<!-- 占位高度 -->
		<view :style="{ height: navBarHeight + 'px' }"></view>

		<scroll-view scroll-y class="detail-scroll" :style="{ height: scrollHeight }">
			<view class="detail-content" v-if="order">
				<!-- 订单状态流程 -->
				<view class="status-flow-section">
					<view class="flow-container">
						<view class="flow-step" 
							v-for="(step, index) in flowSteps" 
							:key="index"
							:class="{ active: order.status >= step.status, current: order.status === step.status }">
							<view class="step-dot">
								<uni-icons v-if="order.status > step.status" type="checkmarkempty" size="16" color="#FFFFFF"></uni-icons>
							</view>
							<text class="step-label">{{ step.label }}</text>
							<text class="step-time" v-if="step.time">{{ step.time }}</text>
							<view class="step-line" v-if="index < flowSteps.length - 1"></view>
						</view>
					</view>
				</view>

				<!-- 物流信息 -->
				<view class="section logistics-section" v-if="order.logistics && order.status === 2">
					<view class="section-header">
						<uni-icons type="car-filled" size="20" color="#22c55e"></uni-icons>
						<text class="section-title">物流信息</text>
					</view>
					<view class="logistics-info">
						<view class="logistics-row">
							<text class="logistics-label">物流公司:</text>
							<text class="logistics-value">{{ order.logistics.company }}</text>
						</view>
						<view class="logistics-row">
							<text class="logistics-label">运单号:</text>
							<text class="logistics-value">{{ order.logistics.trackingNo }}</text>
						</view>
						<view class="logistics-row">
							<text class="logistics-label">状态:</text>
							<text class="logistics-value status">{{ order.logistics.status }}</text>
						</view>
					</view>
				</view>

				<!-- 收货信息 -->
				<view class="section address-section">
					<view class="section-header">
						<uni-icons type="location-filled" size="20" color="#3b82f6"></uni-icons>
						<text class="section-title">收货信息</text>
					</view>
					<view class="address-info">
						<view class="address-row">
							<text class="address-name">{{ order.address.name }}</text>
							<text class="address-phone">{{ order.address.phone }}</text>
						</view>
						<text class="address-detail">{{ getFullAddress(order.address) }}</text>
					</view>
				</view>

				<!-- 商品信息 -->
				<view class="section products-section">
					<view class="section-header">
						<uni-icons type="bag-filled" size="20" color="#f97316"></uni-icons>
						<text class="section-title">商品信息</text>
					</view>
					<view class="products-list">
						<view class="product-item" v-for="(product, index) in order.products" :key="index">
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
				</view>

				<!-- 订单金额 -->
				<view class="section amount-section">
					<view class="section-header">
						<uni-icons type="wallet-filled" size="20" color="#a855f7"></uni-icons>
						<text class="section-title">订单金额</text>
					</view>
					<view class="amount-list">
						<view class="amount-row">
							<text class="amount-label">商品金额</text>
							<text class="amount-value">¥{{ order.totalAmount.toFixed(2) }}</text>
						</view>
						<view class="amount-row">
							<text class="amount-label">运费</text>
							<text class="amount-value">¥{{ order.freight.toFixed(2) }}</text>
						</view>
						<view class="amount-row" v-if="order.discountAmount > 0">
							<text class="amount-label">优惠</text>
							<text class="amount-value discount">-¥{{ order.discountAmount.toFixed(2) }}</text>
						</view>
						<view class="amount-row total">
							<text class="amount-label">实付款</text>
							<text class="amount-value">¥{{ order.actualAmount.toFixed(2) }}</text>
						</view>
					</view>
				</view>

				<!-- 订单信息 -->
				<view class="section info-section">
					<view class="section-header">
						<uni-icons type="list" size="20" color="#64748b"></uni-icons>
						<text class="section-title">订单信息</text>
					</view>
					<view class="info-list">
						<view class="info-row">
							<text class="info-label">订单编号</text>
							<text class="info-value">{{ order.orderNo }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">下单时间</text>
							<text class="info-value">{{ order.createTime }}</text>
						</view>
						<view class="info-row" v-if="order.payTime">
							<text class="info-label">支付时间</text>
							<text class="info-value">{{ order.payTime }}</text>
						</view>
						<view class="info-row" v-if="order.shipTime">
							<text class="info-label">发货时间</text>
							<text class="info-value">{{ order.shipTime }}</text>
						</view>
						<view class="info-row" v-if="order.receiveTime">
							<text class="info-label">收货时间</text>
							<text class="info-value">{{ order.receiveTime }}</text>
						</view>
					</view>
				</view>

				<!-- 底部占位 -->
				<view style="height: 200rpx;"></view>
			</view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar" v-if="order">
			<view class="bar-buttons">
				<view class="btn btn-default" @tap="contactService">
					<uni-icons type="chat" size="20" color="#64748b"></uni-icons>
					<text>客服</text>
				</view>
				
				<!-- 待付款 -->
				<template v-if="order.status === 0">
					<view class="btn btn-default" @tap="cancelOrder">取消订单</view>
					<view class="btn btn-primary" @tap="payOrder">去支付</view>
				</template>
				
				<!-- 待收货 -->
				<template v-else-if="order.status === 2">
					<view class="btn btn-default" @tap="viewLogistics">查看物流</view>
					<view class="btn btn-primary" @tap="confirmReceive">确认收货</view>
				</template>
				
				<!-- 待评价 -->
				<template v-else-if="order.status === 3">
					<view class="btn btn-primary" @tap="evaluate">去评价</view>
				</template>
			</view>
		</view>
	</view>
</template>

<script>
import orderManager from '@/utils/orderManager.js';

export default {
	data() {
		return {
			navBarHeight: 88,
			scrollHeight: '500px',
			orderId: '',
			order: null,
			flowSteps: []
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

		this.scrollHeight = `calc(100vh - ${this.navBarHeight}px - 160rpx)`;

		if (options.id) {
			this.orderId = options.id;
			this.loadOrderDetail();
		}
	},
	methods: {
		loadOrderDetail() {
			this.order = orderManager.getOrderById(this.orderId);
			if (this.order) {
				this.initFlowSteps();
			} else {
				uni.showToast({ title: '订单不存在', icon: 'none' });
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},

		initFlowSteps() {
			this.flowSteps = [
				{ label: '下单', status: 0, time: this.order.createTime },
				{ label: '付款', status: 1, time: this.order.payTime },
				{ label: '发货', status: 2, time: this.order.shipTime },
				{ label: '收货', status: 3, time: this.order.receiveTime },
				{ label: '完成', status: 4, time: this.order.finishTime }
			];
		},

		getFullAddress(address) {
			return `${address.province}${address.city}${address.district}${address.detail}`;
		},

		contactService() {
			uni.showToast({ title: '连接客服中...', icon: 'none' });
		},

		cancelOrder() {
			uni.showModal({
				title: '确认取消',
				content: '确定要取消该订单吗?',
				success: (res) => {
					if (res.confirm) {
						orderManager.updateOrderStatus(this.orderId, 5, { closeTime: new Date().toLocaleString() });
						this.loadOrderDetail();
						uni.showToast({ title: '订单已取消', icon: 'success' });
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				}
			});
		},

		payOrder() {
			uni.showModal({
				title: '支付确认',
				content: `确认支付¥${this.order.actualAmount.toFixed(2)}?`,
				success: (res) => {
					if (res.confirm) {
						orderManager.updateOrderStatus(this.orderId, 1, { 
							payTime: new Date().toLocaleString() 
						});
						this.loadOrderDetail();
						uni.showToast({ title: '支付成功', icon: 'success' });
					}
				}
			});
		},

		confirmReceive() {
			uni.showModal({
				title: '确认收货',
				content: '确认已收到商品吗?',
				success: (res) => {
					if (res.confirm) {
						orderManager.updateOrderStatus(this.orderId, 3, { 
							receiveTime: new Date().toLocaleString() 
						});
						this.loadOrderDetail();
						uni.showToast({ title: '确认收货成功', icon: 'success' });
					}
				}
			});
		},

		viewLogistics() {
			uni.showToast({ title: '物流追踪功能开发中', icon: 'none' });
		},

		evaluate() {
			uni.showToast({ title: '评价功能开发中', icon: 'none' });
		}
	}
}
</script>

<style lang="scss" scoped>
.order-detail-page {
	min-height: 100vh;
	background-color: #f9fafb;

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
	}

	.detail-scroll {
		.detail-content {
			.status-flow-section {
				background-color: #ffffff;
				padding: 60rpx 40rpx;
				margin-bottom: 20rpx;

				.flow-container {
					display: flex;
					justify-content: space-between;
					position: relative;

					.flow-step {
						flex: 1;
						display: flex;
						flex-direction: column;
						align-items: center;
						position: relative;

						.step-dot {
							width: 48rpx;
							height: 48rpx;
							border-radius: 24rpx;
							background-color: #e5e7eb;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-bottom: 16rpx;
							z-index: 2;
							transition: all 0.3s;
						}

						.step-label {
							font-size: 22rpx;
							color: #94a3b8;
							margin-bottom: 8rpx;
						}

						.step-time {
							font-size: 18rpx;
							color: #cbd5e1;
						}

						.step-line {
							position: absolute;
							top: 24rpx;
							left: 50%;
							width: 100%;
							height: 2rpx;
							background-color: #e5e7eb;
							z-index: 1;
						}

						&.active {
							.step-dot {
								background: linear-gradient(135deg, #22c55e, #16a34a);
							}

							.step-label {
								color: #22c55e;
								font-weight: 600;
							}

							.step-time {
								color: #64748b;
							}

							.step-line {
								background: linear-gradient(90deg, #22c55e, #e5e7eb);
							}
						}

						&.current {
							.step-dot {
								box-shadow: 0 0 0 8rpx rgba(34, 197, 94, 0.2);
							}
						}
					}
				}
			}

			.section {
				background-color: #ffffff;
				margin-bottom: 20rpx;
				padding: 30rpx 40rpx;

				.section-header {
					display: flex;
					align-items: center;
					gap: 12rpx;
					margin-bottom: 30rpx;

					.section-title {
						font-size: 30rpx;
						font-weight: 600;
						color: #1e293b;
					}
				}

				&.logistics-section {
					.logistics-info {
						.logistics-row {
							display: flex;
							align-items: center;
							margin-bottom: 20rpx;

							&:last-child {
								margin-bottom: 0;
							}

							.logistics-label {
								font-size: 26rpx;
								color: #64748b;
								width: 150rpx;
							}

							.logistics-value {
								font-size: 26rpx;
								color: #1e293b;

								&.status {
									color: #22c55e;
									font-weight: 600;
								}
							}
						}
					}
				}

				&.address-section {
					.address-info {
						.address-row {
							display: flex;
							align-items: center;
							justify-content: space-between;
							margin-bottom: 16rpx;

							.address-name {
								font-size: 28rpx;
								color: #1e293b;
								font-weight: 600;
							}

							.address-phone {
								font-size: 26rpx;
								color: #64748b;
							}
						}

						.address-detail {
							font-size: 26rpx;
							color: #64748b;
							line-height: 1.6;
						}
					}
				}

				&.products-section {
					.products-list {
						.product-item {
							display: flex;
							gap: 20rpx;
							padding: 24rpx 0;
							border-bottom: 1rpx solid #f1f5f9;

							&:last-child {
								border-bottom: none;
								padding-bottom: 0;
							}

							&:first-child {
								padding-top: 0;
							}

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
				}

				&.amount-section {
					.amount-list {
						.amount-row {
							display: flex;
							align-items: center;
							justify-content: space-between;
							margin-bottom: 20rpx;

							&:last-child {
								margin-bottom: 0;
							}

							.amount-label {
								font-size: 26rpx;
								color: #64748b;
							}

							.amount-value {
								font-size: 26rpx;
								color: #1e293b;

								&.discount {
									color: #22c55e;
								}
							}

							&.total {
								padding-top: 20rpx;
								border-top: 1rpx solid #f1f5f9;

								.amount-label {
									font-size: 28rpx;
									font-weight: 600;
									color: #1e293b;
								}

								.amount-value {
									font-size: 36rpx;
									color: #ef4444;
									font-weight: 700;
								}
							}
						}
					}
				}

				&.info-section {
					.info-list {
						.info-row {
							display: flex;
							align-items: flex-start;
							margin-bottom: 20rpx;

							&:last-child {
								margin-bottom: 0;
							}

							.info-label {
								font-size: 26rpx;
								color: #64748b;
								width: 150rpx;
								flex-shrink: 0;
							}

							.info-value {
								flex: 1;
								font-size: 26rpx;
								color: #1e293b;
								word-break: break-all;
							}
						}
					}
				}
			}
		}
	}

	.bottom-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		padding: 20rpx 40rpx;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 100;

		.bar-buttons {
			display: flex;
			align-items: center;
			gap: 20rpx;

			.btn {
				padding: 20rpx 40rpx;
				border-radius: 40rpx;
				font-size: 26rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 8rpx;
				transition: all 0.3s;

				&.btn-default {
					background-color: #f8f9fa;
					color: #64748b;
					border: 1rpx solid #e5e7eb;
				}

				&.btn-primary {
					flex: 1;
					background: linear-gradient(135deg, #22c55e, #16a34a);
					color: #ffffff;
					border: none;
				}

				&:active {
					transform: scale(0.95);
				}
			}
		}
	}
}
</style>
