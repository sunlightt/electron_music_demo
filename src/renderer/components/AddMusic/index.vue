<template>
    <div class="play_music_page">
        <div class="container mt-4">
            <h1>添加音乐到曲库</h1>
            <div id="musicList" class="mb-2" v-if="!musicList.length">您还未选择任何音乐文件</div>
            <div id="musicList" class="mb-2" v-else>
                <ul class="list-group">
                    <li class="list-group-item" v-for="item in musicList">{{item}}</li>
                </ul>
            </div>
            <button type="button" id="select-music" class="btn btn-outline-primary btn-lg btn-block mt-4" @click="select_music">
                选择音乐
            </button>
            <button type="button" id="add-music" class="btn btn-primary btn-lg btn-block mt-4" @click="import_music">
                导入音乐
            </button>
        </div>
    </div>
</template>
<script>
const { ipcRenderer } = require('electron')
export default {
    data(){
        return{
            musicList:[] 
        }
    },
    mounted(){
        ipcRenderer.on('selected-file',(event,filesPath)=>{
            if(Array.isArray(filesPath)) {
                this.musicList = filesPath;
            }
        });
    },
    methods:{
        add_music(){
            ipcRenderer.send('add-music-window')
        },
        select_music(){
            ipcRenderer.send('open-music-file');
        },
        import_music(){
            ipcRenderer.send('import_music',this.musicList);
        }
    }
}
</script>
<style scoped>

</style>

