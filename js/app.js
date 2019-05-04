Vue.use(Toasted)

// register modal component
Vue.component('modal', {
    props: [
        "value",
        "uploading"
    ],
    template: '#modal-template'
});

var data = {
    processList: [],
    loading: false,
    showModal: false,
    uploading: false,
    uploadFile: {
        fileDir: "",
        file: null
    }
};

var app = new Vue({
    el: '#app',
    data: data,
    filters: {
        turnToState: function(state) {
            switch (state) {
                case 0:
                    return "stopped";
                case 10:
                    return "starting";
                case 20:
                    return "running";
                case 30:
                    return "backoff";
                case 40:
                    return "stopping";
                case 100:
                    return "exited";
                case 200:
                    return "fatal";
                default:
                    return "unknow";
            }
        },
        turnToStateStyle: function(state) {
            switch (state) {
                case 0:
                    return "badge-secondary";
                case 10:
                    return "badge-light";
                case 20:
                    return "badge-success";
                case 30:
                    return "badge-danger";
                case 40:
                    return "badge-info";
                case 100:
                    return "badge-primary";
                case 200:
                    return "badge-warning";
                default:
                    return "badge-dark";
            }
        },
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.loading = true;
            // 取得进程列表
            axios.get('/console/process')
                .then(function(resp) {
                    var body = resp.data;
                    if (body.code == 200) {
                        this.loading = false;
                        console.log(body.data);
                        data.processList = body.data;
                    }
                }.bind(this))
                .catch(function(error) {
                    console.error(error);
                    this.$toasted.error("进程列表加载失败!", {
                        duration: 3000
                    });
                });
        },
        oprateProcess(processName, action, index) {
            Vue.set(this.processList[index], "loading", true);
            axios.post('/console/process/', {
                    processName: processName,
                    action: action
                })
                .then(function(resp) {
                    var body = resp.data;
                    if (body.code == 200) {
                        var operate;
                        switch (action) {
                            case 0:
                                operate = "启动";
                                break;
                            case 1:
                                operate = "重启";
                                break;
                            case 2:
                                operate = "关闭";
                                break;
                            default:
                                operate = "清除日志";
                        }
                        var msg = "进程[" + processName + "] " + operate + "成功!";
                        console.log(msg)
                        console.log(body.data);
                        this.processList.splice(index, 1, body.data);
                        this.$toasted.success(msg, {
                            duration: 3000
                        });
                    }
                }.bind(this))
                .catch(function(error) {
                    console.error(error);
                    this.$toasted.error("进程操作失败!", {
                        duration: 3000
                    });
                });
        },
        oprateAllProcess(action) {
            this.loading = true;
            axios.get('/console/process/all/' + action)
                .then(function(resp) {
                    var body = resp.data;
                    if (body.code == 200) {
                        this.loading = false;
                        console.log("operate sucess")
                        console.log(body.data);
                        this.processList = body.data;
                    }
                }.bind(this))
                .catch(function(error) {
                    console.error(error);
                    this.$toasted.error("进程操作失败!", {
                        duration: 3000
                    });
                });
        },
        getFile(file) {
            this.uploadFile.file = file;
            console.log(this.uploadFile.file);
        },
        submitForm(event) {
            if (this.uploadFile.fileDir.length == 0) {
                this.$toasted.error("文件上传目录不能为空!", {
                    duration: 3000
                });
                return;
            }
            if (this.uploadFile.file == null) {
                this.$toasted.error("请选择待上传文件!", {
                    duration: 3000
                });
                return;
            }
            event.preventDefault();
            this.uploading = true;
            var formData = new FormData();
            formData.append('fileDir', this.uploadFile.fileDir);
            formData.append('file', this.uploadFile.file);

            var config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            axios.post('/console/file', formData, config)
                .then(function(resp) {
                    var body = resp.data;
                    if (body.code == 200) {
                        this.uploading = false;
                        this.showModal = false;
                        this.$toasted.success("文件上传成功!", {
                            duration: 3000
                        });
                        this.uploadFile.file = null;
                    }
                }.bind(this))
                .catch(function(error) {
                    console.error(error);
                    this.$toasted.error("进程操作失败!", {
                        duration: 3000
                    });
                });
        }
    },
});