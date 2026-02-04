<template>
	<view class="profile-page">
		<!-- 头部标题 (适配胶囊) -->
		<custom-navbar bgColor="#FFFFFF" title="个人中心"></custom-navbar>

		<view class="content" :style="{ paddingTop: navBarHeight + 'px' }">
			<!-- 用户信息区 (渐变背景) -->
			<view class="user-section">
				<view class="user-header" @tap="navigateToLogin">
					<view class="avatar-box">
						<uni-icons type="person-filled" size="32" color="#999"></uni-icons>
					</view>
					<view class="user-info">
						<text class="login-btn">登录/注册</text>
					</view>
				</view>

				<!-- 快捷入口网格 -->
				<view class="quick-grid">
					<view class="grid-item" v-for="(item, index) in quickEntries" :key="index">
						<view class="icon-wrap shadow-sm">
							<uni-icons :type="item.icon" size="24" color="#666"></uni-icons>
						</view>
						<text class="label">{{ item.label }}</text>
					</view>
				</view>
			</view>

			<!-- 优惠横幅 -->
			<view class="promo-banner">
				<view class="banner-icon">
					<text class="emoji">📢</text>
				</view>
				<text class="banner-text">花农直供0加价－专注鲜花供应链</text>
			</view>

			<!-- 我的订单卡片 -->
			<view class="card-section">
				<view class="card-header">
					<text class="card-title">我的订单</text>
					<view class="more-link">
						<text>全部订单</text>
						<uni-icons type="right" size="14" color="#999"></uni-icons>
					</view>
				</view>
				<view class="order-stats">
					<view class="stat-item" v-for="(item, index) in orderStats" :key="index">
						<view class="icon-pos">
							<uni-icons :type="item.icon" size="28" :color="item.color"></uni-icons>
							<view class="badge" v-if="item.count > 0">{{ item.count }}</view>
						</view>
						<text class="label">{{ item.label }}</text>
					</view>
				</view>
			</view>

			<!-- 客服热线卡片 -->
			<view class="card-section customer-service">
				<view class="card-title">客服热线 (09:00-18:00)</view>
				<view class="service-body">
					<view class="phone-box">
						<view class="phone-icon">
							<text>📞</text>
						</view>
						<text class="phone-num">153 9867 5476</text>
					</view>
					<view class="online-btn" @tap="handleContact">
						<uni-icons type="chat-filled" size="16" color="#FFFFFF"></uni-icons>
						<text>在线客服</text>
					</view>
					<image 
						src="https://images.unsplash.com/photo-1711715337544-e6c99dbd801a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHBsYW50JTIwbG9nbyUyMGljb258ZW58MXx8fHwxNzcwMDA0ODE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
						class="mini-logo"
					></image>
				</view>
			</view>

			<!-- 服务与工具卡片 -->
			<view class="card-section services">
				<view class="card-title">服务与工具</view>
				<view class="service-grid">
					<view class="service-item" v-for="(item, index) in serviceTools" :key="index">
						<view class="service-icon-bg shadow-xs">
							<uni-icons :type="item.icon" size="24" :color="item.color"></uni-icons>
						</view>
						<text class="service-label">{{ item.label }}</text>
					</view>
				</view>
			</view>

			<view style="height: 120rpx;"></view>
			
			<custom-tabbar currentPath="pages/profile/profile"></custom-tabbar>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				navBarHeight: 64,
				quickEntries: [
					{ label: '常购清单', icon: 'shop' },
					{ label: '商品收藏', icon: 'heart' },
					{ label: '常用品种', icon: 'list' }, // 原 Package 图标对应 list
					{ label: '店铺收藏', icon: 'home' }  // 原 Store 图标对应 home
				],
				orderStats: [
					{ label: "待付款", icon: "wallet", count: 0, color: "#f97316" },
					{ label: "待收货", icon: "cart", count: 0, color: "#3b82f6" },
					{ label: "待发货", icon: "paperplane", count: 0, color: "#22c55e" },
					{ label: "待评价", icon: "chat", count: 0, color: "#a855f7" },
					{ label: "售后", icon: "info", count: 0, color: "#ef4444" }
				],
				serviceTools: [
					{ label: "我的钱包", icon: "wallet-filled", color: "#3b82f6" },
					{ label: "领券中心", icon: "gift-filled", color: "#ef4444" },
					{ label: "售后标准", icon: "paperclip", color: "#22c55e" },
					{ label: "包装费说明", icon: "info-filled", color: "#f97316" },
					{ label: "运费查询", icon: "map-filled", color: "#06b6d4" },
					{ label: "等级标准", icon: "star-filled", color: "#a855f7" },
					{ label: "收货地址", icon: "location-filled", color: "#ec4899" },
					{ label: "投诉建议", icon: "help-filled", color: "#6366f1" }
				]
			};
		},
		onLoad() {
			const systemInfo = uni.getSystemInfoSync();
			this.navBarHeight = systemInfo.statusBarHeight + 44;
		},
		methods: {
			handleContact() {
				uni.showToast({ title: '连接客服中...', icon: 'none' });
			},
			navigateToLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				});
			}
		}
	}
</script>

<style lang="scss">
	.profile-page {
		min-height: 100vh;
		background-color: #f8f9fa;

		.user-section {
			background: linear-gradient(to bottom right, #fdf2f8, #f5f3ff);
			padding: 40rpx 40rpx 60rpx;
			margin-bottom: 20rpx;

			.user-header {
				display: flex;
				align-items: center;
				margin-bottom: 40rpx;

				.avatar-box {
					width: 120rpx;
					height: 120rpx;
					background-color: #e5e7eb;
					border-radius: 60rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 30rpx;
				}

				.login-btn {
					font-size: 32rpx;
					font-weight: 500;
					color: #333;
				}
			}

			.quick-grid {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 30rpx;

				.grid-item {
					display: flex;
					flex-direction: column;
					align-items: center;

					.icon-wrap {
						width: 90rpx;
						height: 90rpx;
						background-color: #ffffff;
						border-radius: 20rpx;
						display: flex;
						align-items: center;
						justify-content: center;
						margin-bottom: 12rpx;
					}

					.label {
						font-size: 22rpx;
						color: #4b5563;
					}
				}
			}
		}

		.promo-banner {
			background: linear-gradient(to right, #fb923c, #ef4444);
			margin: 0 30rpx 20rpx;
			border-radius: 24rpx;
			padding: 0 30rpx;
			height: 100rpx;
			display: flex;
			align-items: center;
			box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.2);

			.banner-icon {
				width: 70rpx;
				height: 70rpx;
				background-color: rgba(255, 255, 255, 0.3);
				border-radius: 16rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 20rpx;
				.emoji { font-size: 36rpx; }
			}

			.banner-text {
				color: #ffffff;
				font-size: 28rpx;
				flex: 1;
			}
		}

		.card-section {
			background-color: #ffffff;
			margin: 0 30rpx 20rpx;
			border-radius: 24rpx;
			padding: 30rpx;
			box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);

			.card-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 30rpx;

				.more-link {
					display: flex;
					align-items: center;
					font-size: 24rpx;
					color: #999;
					gap: 4rpx;
				}
			}

			.card-title {
				font-size: 30rpx;
				font-weight: 600;
				color: #333;
			}

			.order-stats {
				display: flex;
				justify-content: space-between;

				.stat-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					flex: 1;

					.icon-pos {
						position: relative;
						margin-bottom: 8rpx;

						.badge {
							position: absolute;
							top: -4rpx;
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
					}

					.label {
						font-size: 20rpx;
						color: #4b5563;
					}
				}
			}

			&.customer-service {
				.service-body {
					display: flex;
					align-items: center;
					margin-top: 20rpx;
					gap: 20rpx;

					.phone-box {
						flex: 1;
						display: flex;
						align-items: center;
						background-color: #f8f9fa;
						padding: 16rpx 20rpx;
						border-radius: 16rpx;

						.phone-icon {
							width: 60rpx;
							height: 60rpx;
							background-color: #fee2e2;
							border-radius: 30rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-right: 16rpx;
							color: #ef4444;
						}

						.phone-num {
							font-size: 26rpx;
							color: #333;
							font-weight: 500;
							letter-spacing: 1rpx;
						}
					}

					.online-btn {
						background-color: #16a34a;
						color: #ffffff;
						padding: 16rpx 24rpx;
						border-radius: 16rpx;
						display: flex;
						align-items: center;
						gap: 10rpx;
						font-size: 24rpx;
						white-space: nowrap;
					}

					.mini-logo {
						width: 100rpx;
						height: 100rpx;
						border-radius: 12rpx;
					}
				}
			}

			&.services {
				.service-grid {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					gap: 40rpx 20rpx;
					padding-top: 10rpx;

					.service-item {
						display: flex;
						flex-direction: column;
						align-items: center;

						.service-icon-bg {
							width: 88rpx;
							height: 88rpx;
							background-color: #f9fafb;
							border-radius: 20rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							margin-bottom: 12rpx;
						}

						.service-label {
							font-size: 20rpx;
							color: #4b5563;
							text-align: center;
						}
					}
				}
			}
		}
	}

	.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
	.shadow-xs { box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.02); }
</style>
