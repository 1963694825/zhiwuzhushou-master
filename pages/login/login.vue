<template>
	<view class="login-container">
		<!-- 顶部装饰 -->
		<view class="top-decoration">
			<view class="circle-1"></view>
			<view class="circle-2"></view>
		</view>

		<view class="content-box">
			<!-- 情况A：未登录状态 -->
			<view v-if="!isLogin" class="login-view">
				<view class="logo-section">
					<view class="logo-wrapper">
						<uni-icons type="flower" size="60" color="#FFFFFF"></uni-icons>
					</view>
					<text class="app-name">植物助手</text>
					<text class="app-slogan">开启您的智慧种植之旅</text>
				</view>

				<view class="action-section">
					<button class="login-btn" @tap="handleLogin">
						<uni-icons type="weixin" size="24" color="#FFFFFF"></uni-icons>
						<text class="btn-text">微信一键登录</text>
					</button>
					<view class="guest-btn" @tap="handleBack">
						<text>先去逛逛</text>
					</view>
				</view>

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

			<!-- 情况B：已登录，完善资料状态 -->
			<view v-else class="profile-view">
				<view class="title-section">
					<text class="main-title">完善个人资料</text>
					<text class="sub-title">让植物助手更好地称呼您</text>
				</view>

				<view class="form-section">
					<view class="avatar-wrap">
						<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
							<image v-if="tempAvatarUrl" :src="tempAvatarUrl" class="avatar-img"></image>
							<uni-icons v-else type="person-filled" size="48" color="#d1d5db"></uni-icons>
							<view class="edit-icon">
								<uni-icons type="camera-filled" size="18" color="#FFFFFF"></uni-icons>
							</view>
						</button>
					</view>

					<view class="input-item">
						<text class="label">昵称</text>
						<input type="nickname" v-model="nickname" class="nickname-input" placeholder="请输入您的昵称" @blur="onNicknameBlur" />
					</view>

					<button class="submit-btn" :disabled="!isProfileReady" @tap="handleSubmitProfile">确认提交</button>
					<view class="skip-btn" @tap="handleSkip">以后再说</view>
				</view>
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
				isLogin: false,
				tempAvatarUrl: '',
				nickname: '',
				// 强制使用局域网 IP 以提高连接成功率
				baseUrl: 'http://192.168.110.204:9000' 
			};
		},
		computed: {
			isProfileReady() {
				return this.tempAvatarUrl && this.nickname.trim().length > 0;
			}
		},
		onLoad() {
			// 如果已经有缓存的 Token，可以尝试进入完善资料流程
			const token = uni.getStorageSync('token');
			if (token) {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo && (!userInfo.nickname || userInfo.nickname === '微信用户')) {
					this.isLogin = true;
				}
			}
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
				// 调试日志：确认当前请求的地址
				console.log('正在发起登录请求，地址为:', this.baseUrl + '/api/login');

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
									
									// 4. 判断逻辑：如果资料不完善（没有昵称或默认微信用户），则留在本页进入完善资料模式
									if (!userInfo.nickname || userInfo.nickname === '微信用户') {
										uni.showToast({
											title: '登录成功，请完善资料',
											icon: 'success'
										});
										setTimeout(() => {
											this.isLogin = true; // 切换到 profile-view 视图
										}, 1000);
									} else {
										// 资料已完善，直接跳转
										uni.showToast({
											title: '登录成功',
											icon: 'success'
										});
										setTimeout(() => {
											uni.switchTab({
												url: '/pages/profile/profile'
											});
										}, 1500);
									}
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
			},
			onChooseAvatar(e) {
				const { avatarUrl } = e.detail;
				this.tempAvatarUrl = avatarUrl;
				// 注意：在实际项目中，这里应该先调用 uni.uploadFile 将头像上传到服务器
				// 为了演示，我们暂时直接使用这个临时路径（小程序内有效）
			},
			onNicknameBlur(e) {
				this.nickname = e.detail.value;
			},
			handleSubmitProfile() {
				if (!this.isProfileReady) return;

				uni.showLoading({ title: '提交中...' });
				
				uni.request({
					url: this.baseUrl + '/api/user/update',
					method: 'POST',
					header: {
						'Authorization': 'Bearer ' + uni.getStorageSync('token')
					},
					data: {
						nickname: this.nickname,
						avatar_url: this.tempAvatarUrl
					},
					success: (res) => {
						uni.hideLoading();
						if (res.data.code === 200) {
							// 更新本地存储的用户信息
							const userInfo = uni.getStorageSync('userInfo') || {};
							userInfo.nickname = this.nickname;
							userInfo.avatar_url = this.tempAvatarUrl;
							uni.setStorageSync('userInfo', userInfo);

							uni.showToast({ title: '资料已完善', icon: 'success' });
							
							setTimeout(() => {
								uni.switchTab({ url: '/pages/profile/profile' });
							}, 1500);
						} else {
							uni.showToast({ title: res.data.msg, icon: 'none' });
						}
					},
					fail: () => {
						uni.hideLoading();
						uni.showToast({ title: '提交失败，请重试', icon: 'none' });
					}
				});
			},
			handleSkip() {
				uni.switchTab({ url: '/pages/profile/profile' });
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

		.profile-view {
			width: 100%;
			animation: fadeIn 0.5s ease;

			.title-section {
				margin-bottom: 60rpx;
				.main-title {
					display: block;
					font-size: 40rpx;
					font-weight: 700;
					color: #1f2937;
					margin-bottom: 12rpx;
				}
				.sub-title {
					font-size: 26rpx;
					color: #6b7280;
				}
			}

			.form-section {
				.avatar-wrap {
					display: flex;
					justify-content: center;
					margin-bottom: 60rpx;

					.avatar-btn {
						width: 180rpx;
						height: 180rpx;
						border-radius: 90rpx;
						padding: 0;
						background-color: #f3f4f6;
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						border: 2rpx solid #e5e7eb;

						.avatar-img {
							width: 100%;
							height: 100%;
							border-radius: 90rpx;
						}

						.edit-icon {
							position: absolute;
							bottom: 0;
							right: 0;
							width: 50rpx;
							height: 50rpx;
							background-color: #16a34a;
							border-radius: 25rpx;
							display: flex;
							align-items: center;
							justify-content: center;
							border: 4rpx solid #ffffff;
						}
					}
				}

				.input-item {
					background-color: #f9fafb;
					border-radius: 24rpx;
					padding: 30rpx 40rpx;
					margin-bottom: 60rpx;

					.label {
						display: block;
						font-size: 24rpx;
						color: #9ca3af;
						margin-bottom: 16rpx;
					}

					.nickname-input {
						font-size: 32rpx;
						color: #111827;
						height: 40rpx;
					}
				}

				.submit-btn {
					height: 100rpx;
					background: linear-gradient(135deg, #22c55e, #16a34a);
					color: #ffffff;
					border-radius: 50rpx;
					font-size: 32rpx;
					font-weight: 600;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 30rpx;

					&[disabled] {
						opacity: 0.5;
						background: #94a3b8;
					}
				}

				.skip-btn {
					text-align: center;
					padding: 20rpx;
					font-size: 28rpx;
					color: #94a3b8;
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
