<template>
    <div class="play_music_page">
        <div class="container mt-4">
            <h1>我的播放器</h1>
            <button type="button" id="add-music-button" class="btn btn-primary btn-lg btn-block mt-4"  @click="add_music">
                添加歌曲到曲库
            </button>
            <div id="tracksList" class="mt-4" v-if="!musicList.length">
                <div class="alert alert-primary">还没有添加任何音乐</div>
            </div>
            <div id="tracksList" class="mt-4" v-else>
                <ul class="list-group">
                   <li class="row music-track list-group-item d-flex justify-content-between align-items-center" v-for="item in musicList">
                        <div class="col-10">
                            <i class="fas fa-music mr-2 text-secondary"></i>
                            <b>{{item.fileName}}</b>
                        </div>
                        <div class="col-2">
                            <i class="fas  mr-3" :class="current_music.id==item.id && play_status ? 'fa-pause' : 'fa-play' " :data-id="item.id" @click="play_music(item.id)"></i>
                            <i class="fas fa-trash-alt" :data-id="item.id" @click="del_music"></i>
                        </div>
                    </li> 
                </ul>
            </div>
        </div>
        <div class="container fixed-bottom bg-white pb-4">
        <hr/>
        <div class="row my-2" id="player-status" v-if="current_music.fileName">
            <div class="col-9 font-weight-bold">
                正在播放歌曲:{{current_music.fileName}}
            </div>
            <div class="col-3">{{current_times}} / {{this.total_times}}</div>
        </div>
        <div class="progress">
            <div class="progress-bar bg-success" id="player-progress" role="progressbar" :style="{width:`${prossess}%`}">
                {{parseInt(prossess)}}%
            </div>
            
        </div> 
        <!-- 播放控制 -->
        <div class="row play_contron mt-2">
            <div class="col-2 col-sm-offset-3">
                <i class="fa fa-fast-backward" @click="play_pre"></i>
            </div>
            <div class="col-2">
                <i class="fa fa-pause" :class="play_status ? 'fa-pause' : 'fa-play'" @click="play_contron"></i>
            </div>
            <div class="col-2">
                <i class="fa fa-fast-forward" @click="play_next"></i>
            </div>
        </div>
    </div>
    </div>
</template>
<script>
const { ipcRenderer } = require('electron')
const path = require('path');
import {convertDuration} from '../../../utils/utils.js';
import { constants, connect } from 'http2';
export default {
    data(){
        return{
            musicList:[],
            current_music_id:null,
            current_music:{},
            total_times:0, 
            current_times:0,
            prossess:0,
            music_name:null,
            play_status:false
        }
    },
    created(){
        this.musicList = window.localStorage.getItem('musicList') &&  JSON.parse(window.localStorage.getItem('musicList')) || [];   
    },
    mounted(){
        // 音乐导入
        ipcRenderer.on('import_music',(event,files)=>{
            if(Array.isArray(files)){
                this.musicList = files && files.map((item,index)=>{
                    return(
                        {
                            id: index,
                            path: item,
                            fileName: path.basename(item)
                        }
                    )
                });

                window.localStorage.setItem('musicList',JSON.stringify(this.musicList));
            }
        });

        // 创建音乐实例
        this.newVideo = new Audio();

        this.newVideo.addEventListener('loadedmetadata', () => {
            //渲染播放器状态
            this.total_times = convertDuration(this.newVideo.duration);
        });

        this.newVideo.addEventListener('timeupdate', () => {
            //渲染播放器状态
            this.prossess = (this.newVideo.currentTime / this.newVideo.duration)*100;
            this.current_times = convertDuration(this.newVideo.currentTime);
        });
    },
    methods:{
        add_music(){
            ipcRenderer.send('add-music-window')
        },
        play_music(id){
            const musicList = this.musicList;
            const curent_music = musicList && musicList.filter((item)=>{
                return item.id == id;
            });
            if(this.current_music['id']==id){
                if(this.play_status){
                    this.newVideo.pause();
                    this.play_status = false;
                }else{
                    this.newVideo.play();
                    this.play_status = true;
                }
            }else{
                this.newVideo.src = curent_music[0]['path'];
                this.newVideo.play();
                this.total_times = this.newVideo.duration;
                this.play_status = true;
            }
            this.current_music =  curent_music[0];
        },
        del_music(e){
            const { dataset, classList } = event.target
            const id = dataset.id;
            let musicList = this.musicList;
            musicList = musicList && musicList.filter((item)=>{
                return item.id != id;
            });
            // 如果删除的是正在播放发将停止播放
            if(id==this.current_music.id){
                this.newVideo.pause();
                this.play_status = false;
                this.current_times = 0;
                this.prossess = 0;
            }
            this.musicList =  musicList;
            window.localStorage.setItem('musicList',JSON.stringify(musicList));
        },
        // 播放上一首
        play_pre(){
            const musicList = this.musicList;
            let current_music = this.current_music;
            if(!current_music){
                return;
            }
            musicList && musicList.map((item,index)=>{
                if(item.id === current_music.id && index>0){
                    current_music = musicList[index-1];
                }
            });
            this.play_music(current_music.id);
        },
        // 播放控制
        play_contron(){
            if(this.play_status){
                this.newVideo.pause();
                this.play_status = false;
            }else{
                this.newVideo.play();
                this.play_status = true;
            }
        },
        // 播放下一首
        play_next(){
            const musicList = this.musicList;
            let current_music = this.current_music;
            let new_current_music = null;
            if(!current_music){
                return;
            }
            console.log('item',current_music.id);
            musicList && musicList.map((item,index)=>{
                if((item.id === current_music.id) && (index<musicList.length-1)){
                    console.log('id1',item.id)
                    new_current_music = musicList[index+1];
                }
            });
            if(!new_current_music){
                return;
            }
            this.play_music(new_current_music.id);
        }
    }
}
</script>
<style scoped>

</style>

