<template>
	<view class="page" v-if="checkPermission(['ROOT', 'EMPLOYEE:SELECT'])">
		<view class="header">
			<icon type="search" size="15" class="search-icon"></icon>
			<input
				type="text"
				confirm-type="search"
				class="keyword"
				v-model="keyword"
				maxlength="15"
				placeholder="输入要检索的员工姓名"
				@input="search"
			/>
			<button class="btn" @tap="toPage" v-if="checkPermission(['ROOT', 'EMPLOYEE:INSERT'])">添加员工</button>
		</view>
		<view v-for="dept in list" :key="dept.id">
			<view class="list-title">{{ dept.deptName }}（{{ dept.count }}人）</view>
			<uni-list v-if="dept.count > 0">
				<uni-list-item
					v-for="emp in dept.members"
					:title="emp.name"
					:key="emp.userId"
					link="navigateTo"
					:to="'./user_info?userId=' + emp.userId"
				></uni-list-item>
			</uni-list>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			keyword: null
		};
	},
	onShow() {
		this.search();
	},
	methods: {
		search() {
			let keyword = !this.keyword ? null : this.keyword;
			if (!keyword || /^[\u4e00-\u9fa5]{1,15}$/g.test(keyword)) {
				this.ajax(this.url.searchMembersByKeyword, 'POST', { keyword: keyword }, resp => {
					this.list = resp.data.result;
				});
			}
		},
		toPage() {
			uni.navigateTo({
				url: './user_info?opt=insert'
			})
		}
	}
};
</script>

<style lang="less">
@import url('user_list.less');
</style>
