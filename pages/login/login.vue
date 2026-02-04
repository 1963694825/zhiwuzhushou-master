<template>
	<view class="login-container">
		<!-- 顶部装饰 -->
		<view class="top-decoration">
			<view class="circle-1"></view>
			<view class="circle-2"></view>
		</view>

		<view class="content-box">
			<!-- Logo 区域 -->
			<view class="logo-section">
				<view class="logo-wrapper">
					<uni-icons type="flower" size="60" color="#FFFFFF"></uni-icons>
				</view>
				<text class="app-name">植物助手</text>
				<text class="app-slogan">开启您的智慧种植之旅</text>
			</view>

			<!-- 登录操作区 -->
			<view class="action-section">
				<button class="login-btn" @tap="handleLogin">
					<uni-icons type="weixin" size="24" color="#FFFFFF"></uni-icons>
					<text class="btn-text">微信一键登录</text>
				</button>
				
				<view class="guest-btn" @tap="handleBack">
					<text>先去逛逛</text>
				</view>
			</view>

			<!-- 协议勾选 -->
			<view class="agreement-section">
				<checkbox-group @change="onAgreementChange">
					<label class="checkbox-label">
						<checkbox value="agree" :checked="isAgreed" color="#16a34a" style="transform:scale(0.7)" />
						<text class="agreement-text">
							我已阅读并同意 <text class="link">《用户服务协议》</text> 与 <text class="link">《隐私政策》</text>
						</text>
					</label>
				</checkbox-group>
			</view>
		</view>

		<!-- 底部提示 -->
		<view class="footer-tips">
			<text>© 2026 植物助手 版权所有</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isAgreed: false,
				// 如果您已经修改了 server/.env 中的 PORT，请在此修改地址
				baseUrl: 'http://localhost:3000' 
			};
		},
		methods: {
			onAgreementChange(e) {
				this.isAgreed = e.detail.value.length > 0;
			},
			handleBack() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			},
			// 核心登录逻辑
			handleLogin() {
				if (!this.isAgreed) {
					uni.showToast({
						title: '请先同意用户协议',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({ title: '登录中...' });

				// 1. 获取微信临时登录凭证 Code
				uni.login({
					provider: 'weixin',
					success: (loginRes) => {
						console.log('获取Code成功:', loginRes.code);
						
						// 2. 调用后端登录接口
						uni.request({
							url: this.baseUrl + '/api/login',
							method: 'POST',
							data: {
								code: loginRes.code
							},
							success: (res) => {
								uni.hideLoading();
								if (res.data.code === 200) {
									const { token, userInfo } = res.data.data;
									
									// 3. 存储 Token 和用户信息
									uni.setStorageSync('token', token);
									uni.setStorageSync('userInfo', userInfo);
									
									uni.showToast({
										title: '登录成功',
										icon: 'success'
									});
									
									// 4. 延迟跳转回上一页或首页
									setTimeout(() => {
										uni.switchTab({
											url: '/pages/profile/profile'
										});
									}, 1500);
								} else {
									uni.showToast({
										title: res.data.msg || '登录失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								uni.hideLoading();
								uni.showToast({
									title: '网络请求失败，请检查后端服务',
									icon: 'none'
								});
								console.error('Login Request Fail:', err);
							}
						});
					},
					fail: (err) => {
						uni.hideLoading();
						uni.showToast({
							title: '微信登录授权失败',
							icon: 'none'
						});
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-container {
		min-height: 100vh;
		background-color: #ffffff;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;

		.top-decoration {
			position: absolute;
			top: -100rpx;
			right: -100rpx;
			width: 400rpx;
			height: 400rpx;
			z-index: 0;

			.circle-1 {
				position: absolute;
				width: 300rpx;
				height: 300rpx;
				background-color: #f0fdf4;
				border-radius: 50%;
				top: 0;
				right: 0;
			}

			.circle-2 {
				position: absolute;
				width: 200rpx;
				height: 200rpx;
				background-color: #dcfce7;
				border-radius: 50%;
				top: 50rpx;
				right: 50rpx;
				opacity: 0.6;
			}
		}

		.content-box {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0 60rpx;
			z-index: 1;
		}

		.logo-section {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-bottom: 120rpx;

			.logo-wrapper {
				width: 160rpx;
				height: 160rpx;
				background: linear-gradient(135deg, #4ade80, #16a34a);
				border-radius: 40rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 20rpx 40rpx rgba(22, 163, 74, 0.2);
				margin-bottom: 40rpx;
			}

			.app-name {
				font-size: 48rpx;
				font-weight: 700;
				color: #030213;
				margin-bottom: 16rpx;
			}

			.app-slogan {
				font-size: 28rpx;
				color: #717182;
			}
		}

		.action-section {
			width: 100%;
			margin-bottom: 60rpx;

			.login-btn {
				height: 100rpx;
				background: linear-gradient(135deg, #22c55e, #16a34a);
				border-radius: 50rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-shadow: 0 10rpx 20rpx rgba(22, 163, 74, 0.2);
				border: none;
				outline: none;

				.btn-text {
					color: #ffffff;
					font-size: 32rpx;
					font-weight: 600;
					margin-left: 16rpx;
				}

				&:active {
					transform: scale(0.98);
					opacity: 0.9;
				}
			}

			.guest-btn {
				text-align: center;
				padding: 30rpx;
				
				text {
					font-size: 28rpx;
					color: #94a3b8;
				}
			}
		}

		.agreement-section {
			.checkbox-label {
				display: flex;
				align-items: flex-start;
			}

			.agreement-text {
				font-size: 24rpx;
				color: #64748b;
				line-height: 1.6;

				.link {
					color: #16a34a;
					margin: 0 4rpx;
				}
			}
		}

		.footer-tips {
			padding: 40rpx;
			text-align: center;
			
			text {
				font-size: 22rpx;
				color: #cbd5e1;
			}
		}
	}
</style>
