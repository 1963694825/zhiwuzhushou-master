<template>
	<view class="tabbar-placeholder">
		<view class="tabbar-container">
			<view 
				class="tabbar-item" 
				v-for="(item, index) in list" 
				:key="index"
				@tap="switchTab(item.pagePath)"
			>
				<view class="icon-box">
					<uni-icons 
						:type="currentPath === item.pagePath ? item.activeIcon : item.icon" 
						size="24" 
						:color="currentPath === item.pagePath ? '#16a34a' : '#717182'"
					></uni-icons>
				</view>
				<text class="label" :class="{ active: currentPath === item.pagePath }">{{ item.text }}</text>
			</view>
		</view>
		<!-- 底部安全区占位 -->
		<view class="safe-area-inset-bottom"></view>
	</view>
</template>

<script>
	export default {
		props: {
			currentPath: {
				type: String,
				default: 'pages/index/index'
			}
		},
		data() {
			return {
				list: [
					{
						pagePath: 'pages/index/index',
						text: '首页',
						icon: 'home',
						activeIcon: 'home-filled'
					},
					{
						pagePath: 'pages/shop/shop',
						text: '商城',
						icon: 'shop',
						activeIcon: 'shop-filled'
					},
					{
						pagePath: 'pages/knowledge/knowledge',
						text: '知识',
						icon: 'list',
						activeIcon: 'list' // 确保在 uni-icons 中该图标存在
					},
					{
						pagePath: 'pages/profile/profile',
						text: '我的',
						icon: 'person',
						activeIcon: 'person-filled'
					}
				]
			};
		},
		methods: {
			switchTab(path) {
				if (this.currentPath === path) return;
				uni.switchTab({
					url: '/' + path
				});
			}
		}
	}
</script>

<style lang="scss">
	.tabbar-placeholder {
		height: calc(100rpx + constant(safe-area-inset-bottom));
		height: calc(100rpx + env(safe-area-inset-bottom));
	}
	
	.tabbar-container {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: calc(100rpx + constant(safe-area-inset-bottom));
		height: calc(100rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 1rpx solid #f3f3f5;
		display: flex;
		align-items: flex-start;
		justify-content: space-around;
		padding-top: 10rpx;
		z-index: 999;
		
		.tabbar-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			flex: 1;
			
			.icon-box {
				margin-bottom: 4rpx;
			}
			
			.label {
				font-size: 20rpx;
				color: #717182;
				
				&.active {
					color: #16a34a;
					font-weight: 500;
				}
			}
		}
	}
	
	.safe-area-inset-bottom {
		height: constant(safe-area-inset-bottom);
		height: env(safe-area-inset-bottom);
	}
</style>
