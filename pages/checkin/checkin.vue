<template>
	<view class="checkin-page">
		<!-- 自定义导航栏 -->
		<custom-navbar :bgColor="'#FFFFFF'" :showBack="true">
			<view class="nav-title">每日签到</view>
		</custom-navbar>

		<!-- 占位高度 -->
		<view :style="{ height: navBarHeight + 'px' }"></view>

		<!-- 签到卡片 -->
		<view class="checkin-card">
			<view class="card-header">
				<view class="header-bg">
					<image src="https://images.unsplash.com/photo-1651807193045-1b366e7f347f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800" mode="aspectFill" class="bg-image"></image>
					<view class="overlay"></view>
				</view>
				<view class="header-content">
					<text class="title">坚持签到</text>
					<text class="subtitle">每天签到领取积分奖励</text>
					<view class="points-info">
						<text class="points-label">当前积分</text>
						<text class="points-value">{{ userPoints }}</text>
					</view>
				</view>
			</view>

			<!-- 签到按钮 -->
			<view class="checkin-button-wrapper">
				<view class="checkin-button" :class="{ checked: isCheckedToday }" @tap="handleCheckin">
					<view class="button-icon">
						<uni-icons :type="isCheckedToday ? 'checkmarkempty' : 'calendar-filled'" size="32" color="#FFFFFF"></uni-icons>
					</view>
					<text class="button-text">{{ isCheckedToday ? '今日已签到' : '立即签到' }}</text>
					<text class="button-reward" v-if="!isCheckedToday">+{{ todayReward }}积分</text>
				</view>
			</view>
		</view>

		<!-- 连续签到天数 -->
		<view class="streak-section">
			<view class="streak-card">
				<view class="streak-icon">🔥</view>
				<view class="streak-info">
					<text class="streak-label">连续签到</text>
					<text class="streak-days">{{ consecutiveDays }}天</text>
				</view>
			</view>
			<view class="streak-card">
				<view class="streak-icon">📅</view>
				<view class="streak-info">
					<text class="streak-label">累计签到</text>
					<text class="streak-days">{{ totalDays }}天</text>
				</view>
			</view>
		</view>

		<!-- 签到日历 -->
		<view class="calendar-section">
			<view class="section-title">
				<text class="title-text">本月签到记录</text>
				<text class="month-text">{{ currentMonth }}</text>
			</view>
			
			<view class="calendar-grid">
				<view class="week-header">
					<text class="week-day" v-for="(day, index) in weekDays" :key="index">{{ day }}</text>
				</view>
				<view class="calendar-days">
					<view 
						class="day-item" 
						v-for="(day, index) in calendarDays" 
						:key="index"
						:class="{ 
							checked: day.checked, 
							today: day.isToday,
							empty: !day.day 
						}"
					>
						<text class="day-number" v-if="day.day">{{ day.day }}</text>
						<view class="check-mark" v-if="day.checked">✓</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 签到奖励规则 -->
		<view class="rewards-section">
			<view class="section-title">
				<text class="title-text">签到奖励规则</text>
			</view>
			<view class="rewards-list">
				<view class="reward-item" v-for="(reward, index) in rewardRules" :key="index">
					<view class="reward-icon">{{ reward.icon }}</view>
					<view class="reward-info">
						<text class="reward-title">{{ reward.title }}</text>
						<text class="reward-desc">{{ reward.desc }}</text>
					</view>
					<view class="reward-points">+{{ reward.points }}</view>
				</view>
			</view>
		</view>

		<!-- 底部安全区域 -->
		<view class="safe-area-bottom"></view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			navBarHeight: 88,
			userPoints: 1280,
			isCheckedToday: false,
			consecutiveDays: 7,
			totalDays: 45,
			todayReward: 10,
			currentMonth: '',
			weekDays: ['日', '一', '二', '三', '四', '五', '六'],
			calendarDays: [],
			rewardRules: [
				{ icon: '📅', title: '每日签到', desc: '每天签到可获得积分', points: 10 },
				{ icon: '🔥', title: '连续7天', desc: '连续签到7天额外奖励', points: 50 },
				{ icon: '💎', title: '连续30天', desc: '连续签到30天额外奖励', points: 200 },
				{ icon: '🎁', title: '首次签到', desc: '首次签到额外奖励', points: 20 }
			]
		};
	},
	onLoad() {
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

		// 初始化数据
		this.initCalendar();
		this.loadCheckinData();
	},
	methods: {
		initCalendar() {
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth();
			const today = now.getDate();
			
			// 设置当前月份
			this.currentMonth = `${year}年${month + 1}月`;
			
			// 获取本月第一天是星期几
			const firstDay = new Date(year, month, 1).getDay();
			// 获取本月有多少天
			const daysInMonth = new Date(year, month + 1, 0).getDate();
			
			// 生成日历数组
			const days = [];
			
			// 添加空白天数
			for (let i = 0; i < firstDay; i++) {
				days.push({ day: null, checked: false, isToday: false });
			}
			
			// 添加本月天数
			for (let i = 1; i <= daysInMonth; i++) {
				days.push({
					day: i,
					checked: this.isDateChecked(year, month, i),
					isToday: i === today
				});
			}
			
			this.calendarDays = days;
		},
		
		isDateChecked(year, month, day) {
			// TODO: 从服务器或本地存储获取签到记录
			// 这里模拟一些已签到的日期
			const checkedDates = [1, 2, 3, 4, 5, 6, 7];
			return checkedDates.includes(day);
		},
		
		loadCheckinData() {
			// TODO: 从服务器加载签到数据
			// 模拟数据
			const checkinData = uni.getStorageSync('checkinData') || {};
			const today = new Date().toDateString();
			
			this.isCheckedToday = checkinData.lastCheckin === today;
			this.consecutiveDays = checkinData.consecutiveDays || 0;
			this.totalDays = checkinData.totalDays || 0;
			this.userPoints = checkinData.points || 0;
		},
		
		handleCheckin() {
			if (this.isCheckedToday) {
				uni.showToast({
					title: '今日已签到',
					icon: 'none'
				});
				return;
			}
			
			// 执行签到
			const today = new Date().toDateString();
			const checkinData = uni.getStorageSync('checkinData') || {};
			
			// 更新签到数据
			checkinData.lastCheckin = today;
			checkinData.consecutiveDays = (checkinData.consecutiveDays || 0) + 1;
			checkinData.totalDays = (checkinData.totalDays || 0) + 1;
			checkinData.points = (checkinData.points || 0) + this.todayReward;
			
			// 保存到本地
			uni.setStorageSync('checkinData', checkinData);
			
			// 更新页面数据
			this.isCheckedToday = true;
			this.consecutiveDays = checkinData.consecutiveDays;
			this.totalDays = checkinData.totalDays;
			this.userPoints = checkinData.points;
			
			// 更新日历
			this.initCalendar();
			
			// 显示成功动画
			uni.showToast({
				title: `签到成功 +${this.todayReward}积分`,
				icon: 'success',
				duration: 2000
			});
			
			// TODO: 调用后端API保存签到记录
		}
	}
}
</script>

<style lang="scss" scoped>
.checkin-page {
	min-height: 100vh;
	background-color: #f9fafb;
	padding-bottom: 40rpx;

	.nav-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
	}

	.checkin-card {
		margin: 40rpx 30rpx;
		background-color: #ffffff;
		border-radius: 32rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);

		.card-header {
			position: relative;
			height: 400rpx;

			.header-bg {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;

				.bg-image {
					width: 100%;
					height: 100%;
				}

				.overlay {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.8));
				}
			}

			.header-content {
				position: relative;
				z-index: 1;
				padding: 60rpx 40rpx;
				color: #ffffff;

				.title {
					font-size: 48rpx;
					font-weight: 700;
					display: block;
					margin-bottom: 16rpx;
				}

				.subtitle {
					font-size: 26rpx;
					opacity: 0.9;
					display: block;
					margin-bottom: 40rpx;
				}

				.points-info {
					display: flex;
					align-items: baseline;
					gap: 16rpx;

					.points-label {
						font-size: 24rpx;
						opacity: 0.9;
					}

					.points-value {
						font-size: 56rpx;
						font-weight: 800;
					}
				}
			}
		}

		.checkin-button-wrapper {
			padding: 40rpx;

			.checkin-button {
				background: linear-gradient(135deg, #22c55e, #16a34a);
				border-radius: 24rpx;
				padding: 32rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				box-shadow: 0 8rpx 20rpx rgba(34, 197, 94, 0.3);
				transition: all 0.3s;

				&.checked {
					background: linear-gradient(135deg, #94a3b8, #64748b);
					box-shadow: 0 4rpx 12rpx rgba(100, 116, 139, 0.2);
				}

				.button-icon {
					margin-bottom: 16rpx;
				}

				.button-text {
					font-size: 32rpx;
					font-weight: 600;
					color: #ffffff;
					margin-bottom: 8rpx;
				}

				.button-reward {
					font-size: 24rpx;
					color: #ffffff;
					opacity: 0.9;
				}
			}
		}
	}

	.streak-section {
		display: flex;
		gap: 20rpx;
		margin: 0 30rpx 40rpx;

		.streak-card {
			flex: 1;
			background-color: #ffffff;
			border-radius: 24rpx;
			padding: 32rpx;
			display: flex;
			align-items: center;
			gap: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

			.streak-icon {
				font-size: 48rpx;
			}

			.streak-info {
				display: flex;
				flex-direction: column;

				.streak-label {
					font-size: 24rpx;
					color: #64748b;
					margin-bottom: 8rpx;
				}

				.streak-days {
					font-size: 36rpx;
					font-weight: 700;
					color: #1e293b;
				}
			}
		}
	}

	.calendar-section {
		background-color: #ffffff;
		margin: 0 30rpx 40rpx;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

		.section-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 32rpx;

			.title-text {
				font-size: 30rpx;
				font-weight: 600;
				color: #1e293b;
			}

			.month-text {
				font-size: 24rpx;
				color: #64748b;
			}
		}

		.calendar-grid {
			.week-header {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				margin-bottom: 20rpx;

				.week-day {
					text-align: center;
					font-size: 24rpx;
					color: #64748b;
					padding: 10rpx 0;
				}
			}

			.calendar-days {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				gap: 12rpx;

				.day-item {
					aspect-ratio: 1;
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					border-radius: 12rpx;
					background-color: #f8f9fa;

					&.empty {
						background-color: transparent;
					}

					&.today {
						background-color: #dbeafe;
						border: 2rpx solid #3b82f6;

						.day-number {
							color: #3b82f6;
							font-weight: 600;
						}
					}

					&.checked {
						background: linear-gradient(135deg, #22c55e, #16a34a);

						.day-number {
							color: #ffffff;
						}

						.check-mark {
							position: absolute;
							bottom: 4rpx;
							right: 4rpx;
							font-size: 16rpx;
							color: #ffffff;
						}
					}

					.day-number {
						font-size: 24rpx;
						color: #1e293b;
					}
				}
			}
		}
	}

	.rewards-section {
		background-color: #ffffff;
		margin: 0 30rpx;
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

		.section-title {
			margin-bottom: 32rpx;

			.title-text {
				font-size: 30rpx;
				font-weight: 600;
				color: #1e293b;
			}
		}

		.rewards-list {
			.reward-item {
				display: flex;
				align-items: center;
				padding: 24rpx 0;
				border-bottom: 1rpx solid #f1f5f9;

				&:last-child {
					border-bottom: none;
				}

				.reward-icon {
					width: 80rpx;
					height: 80rpx;
					background-color: #f0fdf4;
					border-radius: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 40rpx;
					margin-right: 24rpx;
				}

				.reward-info {
					flex: 1;
					display: flex;
					flex-direction: column;

					.reward-title {
						font-size: 28rpx;
						font-weight: 600;
						color: #1e293b;
						margin-bottom: 8rpx;
					}

					.reward-desc {
						font-size: 24rpx;
						color: #64748b;
					}
				}

				.reward-points {
					font-size: 32rpx;
					font-weight: 700;
					color: #22c55e;
				}
			}
		}
	}

	.safe-area-bottom {
		height: env(safe-area-inset-bottom);
	}
}
</style>
