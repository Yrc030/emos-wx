<template>
	<view class="page">
		<view>
			<input
				type="text"
				class="retrieve"
				confirm-type="search"
				v-model="keyword"
				placeholder="输入关键字进行检索"
				placeholder-class="retrieve-placeholder"
				@input="input"
				@focus="showOps = true"
			/>
		</view>
		<checkbox-group @change="selected">
			<block v-for="dept in depts" :key="dept.id">
				<view class="dept-name">{{ dept.deptName }}（{{ dept.count }}人）</view>
				<view class="members" v-for="member in dept.members" :key="member.userId">
					<view class="key">{{ member.name }}</view>
					<checkbox class="value" :value="member.userId" :checked="member.checked"></checkbox>
				</view>
			</block>
		</checkbox-group>
	</view>
</template>

<script>
export default {
	data() {
		return {
			keyword: '',
			depts: [],
			selectedIds: []
		};
	},
	onLoad(option) {
		// console.log(option);
		console.log(option.ids);
		if(option.hasOwnProperty('ids')) {
			this.selectedIds = option.ids.split(',');
		}
		this.search();
	},
	methods: {
		input(e) {
			this.search();
		},
		selected(e) {
			// 被选中的成员id更新到模型层
			this.selectedIds = e.detail.value;
			// 向上一页绑定选择成员
			let pages = getCurrentPages();
			let prevPage = pages[pages.length - 2];
			prevPage.ids = this.selectedIds;
			prevPage.backFlag = true;
		},
		search() {
			console.log('keyword = ', keyword);
			console.log('selectIds = ', this.selectedIds)
			let keyword = this.keyword;
			if (!keyword || keyword == '' || /^[\u4e00-\u9fa5]{1,15}$/g.test(keyword)) {
				keyword = !keyword ? null : keyword;
				this.ajax(this.url.searchMembersByKeyword, 'POST', { keyword: keyword  }, resp => {
					this.depts = resp.data.result;
					for (let dept of this.depts) {
						for (let member of dept.members) {
							member.checked = this.selectedIds.includes(member.userId + '');
						}
					}
					//console.log(this.depts);
				});
			}
		}
	},
};
</script>

<style lang="less">
@import url('members.less');
</style>
