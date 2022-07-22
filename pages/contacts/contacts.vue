<template>
	<view><uni-indexed-list :options="list" :showSelect="false" @click="clickContact"></uni-indexed-list></view>
</template>

<script>
export default {
	data() {
		return {
			list: []
		};
	},
	onShow() {
		console.log('show');
		this.list = [];
		this.getContactList();
	},
	methods: {
		getContactList() {
			this.ajax(this.url.getContactList, 'GET', null, resp => {
				let res = resp.data.result;
				for (let key in res) {
					let nameList = [];
					let telList = [];
					for (let one of res[key]) {
						let name = one.name;
						let dept = '(' + one.dept + ')';
						nameList.push(`${name} ${dept}`);
						telList.push(one.tel);
					}
					this.list.push({
						letter: key,
						data: nameList,
						tels: telList
					});
				}
			});
		},
		clickContact(e) {
			let letter = e.item.key;
			let name = e.item.name;
			let index = e.item.itemIndex;
			let tel = null;
			for(let one of this.list) {
				if(one.letter == letter) {
					tel = one.tels[index];
					break;
				}
			}
			if(!tel) {
				uni.showToast({
					title: '无联系电话',
					icon: 'none'
				})
				return;
			}
			let item = e.item;
			uni.showModal({
				title: '提示信息',
				content: '是否要打电话给' + item.name + '？',
				success: function(res) {
					if (res.confirm) {
						uni.makePhoneCall({
							phoneNumber: tel
						});
					}
				}
			});
		}
	}
};
</script>

<style lang="less">
@import url('contacts.less');
</style>
