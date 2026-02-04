<template>
	<view class="navbar-container" :style="{ height: navBarHeight + 'px', backgroundColor: bgColor }">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<view class="nav-content" :style="{ height: contentHeight + 'px' }">
			<view class="left-slot" v-if="showBack" @tap="goBack">
				<uni-icons type="left" size="24" :color="iconColor"></uni-icons>
			</view>
			<view class="center-content" :class="{ 'has-left': showBack }">
				<slot>
					<text class="title" :style="{ color: titleColor }">{{ title }}</text>
				</slot>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: ''
			},
			showBack: {
				type: Boolean,
				default: false
			},
			bgColor: {
				type: String,
				default: '#FFFFFF'
			},
			titleColor: {
				type: String,
				default: '#030213'
			},
			iconColor: {
				type: String,
				default: '#030213'
			}
		},
		data() {
			return {
				statusBarHeight: 0,
				contentHeight: 44,
				navBarHeight: 64
			};
		},
		created() {
			// 获取系统信息
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight;
			
			// #ifdef MP-WEIXIN
			// 获取胶囊按钮位置
			const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
			// 计算内容高度 = (胶囊底部 - 状态栏高度) + (胶囊顶部 - 状态栏高度)
			// 或者简单点：内容高度 = 胶囊高度 + (胶囊距离状态栏的距离) * 2
			this.contentHeight = (menuButtonInfo.top - this.statusBarHeight) * 2 + menuButtonInfo.height;
			this.navBarHeight = this.statusBarHeight + this.contentHeight;
			// #endif
			
			// #ifndef MP-WEIXIN
			this.contentHeight = 44;
			this.navBarHeight = this.statusBarHeight + this.contentHeight;
			// #endif
		},
		methods: {
			goBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss">
	.navbar-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 999;
		
		.status-bar {
			width: 100%;
		}
		
		.nav-content {
			width: 100%;
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			position: relative;
			
			.left-slot {
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 20rpx;
			}
			
			.center-content {
				flex: 1;
				display: flex;
				align-items: center;
				
				&.has-left {
					// 如果有返回按钮，标题可能需要偏移或居中
				}
				
				.title {
					font-size: 34rpx;
					font-weight: 500;
				}
			}
		}
	}
</style>
