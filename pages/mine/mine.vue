<template>
	<view class="page">
		<view class="user-summary">
			<view class="border-outer">
					<view class="border-inner"><image :src="photo" class="photo" mode="widthFix"></image></view>
			</view>
			<view class="summary">
				<view>
					<text class="title">姓名</text>
					<text class="value">{{ name }}</text>
				</view>
				<view>
					<text class="title">部门</text>
					<text class="value">{{ deptName }}</text>
				</view>
				<view>
					<text class="title">状态</text>
					<text class="value">在职</text>
				</view>
			</view>
		</view>
		<view class="user-info">
			<view class="list-title">
				<text>用户信息栏目</text>
			</view>
			<uni-list>
				<uni-list-item title="个人资料" showArrow link="navigateTo" to="" />
				<uni-list-item title="我的考勤" showArrow link="navigateTo" to="../../checkin/my_checkin"/>
				<uni-list-item title="罚款记录" showArrow link="navigateTo" to="" />
			</uni-list>
		</view>
		<view class="system-config">
			<view class="list-title">
				<text>系统管理栏目</text>
			</view>
			<uni-list>
				<uni-list-item title="员工管理" showArrow link="navigateTo" to="" v-show="checkPermission(['ROOT','EMPLOYEE:SELECT'])" to="../../user/user_list"/>
				<uni-list-item title="部门管理" showArrow link="navigateTo" to="" v-show="checkPermission(['ROOT', 'DEPT:SELECT'])" to="../dept_list/dept_list"/>
				<uni-list-item title="权限管理" showArrow link="navigateTo" to="" v-show="checkPermission(['ROOT','ROLE:SELECT'])" to="../role_list/role_list"/>
			</uni-list>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			name: '',
			photo: '',
			deptName: ''
		};
	},
	onShow() {
		let vm = this;
		vm.ajax(vm.url.getUserSummary, 'GET', null, resp => {
			let result = resp.data.result;
			vm.name = result.name;
			vm.photo = result.photo;
			vm.deptName = result.deptName;
		})
	},
	methods: {
	}
};
</script>

<style lang="less">
@import url('mine.less');
</style>
