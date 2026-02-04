<template>
	<view class="navbar-container" :style="{ height: navBarHeight + 'px', backgroundColor: bgColor }">
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
		<view class="nav-content" :style="{ height: contentHeight + 'px' }">
			<!-- 左侧返回区域 -->
			<view class="left-slot" v-if="showBack" @tap="goBack">
				<uni-icons type="left" size="24" :color="iconColor"></uni-icons>
			</view>
			
			<!-- 中间插槽区域 (Flex 伸缩，用于搜索框等) -->
			<view class="center-slot">
				<slot></slot>
			</view>

			<!-- 标题层 (绝对定位，物理居中) -->
			<view v-if="title" class="title-container">
				<text class="title-text" :style="{ color: titleColor }">{{ title }}</text>
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
			padding: 0; // 移除全局 padding，改为在 slot 里控制，确保 title 定位基准是全屏
			position: relative;
			
			.left-slot {
				width: 100rpx; // 给个固定或最小宽度
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				z-index: 10;
			}
			
			.center-slot {
				flex: 1;
				display: flex;
				align-items: center;
				height: 100%;
				padding: 0 30rpx; // 将 padding 移动到这里，确保搜索框不会贴边
				position: relative;
				z-index: 5;
			}

			.title-container {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
				pointer-events: none;
				z-index: 1;
				
				.title-text {
					font-size: 34rpx;
					font-weight: 500;
					white-space: nowrap;
				}
			}
		}
	}
</style>
