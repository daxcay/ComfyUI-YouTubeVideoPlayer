import { app } from "../../scripts/app.js";

class ComfyUIYouTubeVideoPlayer {

    constructor(app) {

        this.app = app
        this.nodes = []
        this.elements = {}
        this.onNodeAdded = this.onNodeAdded.bind(this);
        this.onNodeRemoved = this.onNodeRemoved.bind(this);
        this.onInputChanged = this.onInputChanged.bind(this);

    }

    onNodeAdded(node) {
        if (node.type === "YouTubePlayer") {
            this.registerNode(node, 1)
        }
    }

    onNodeRemoved(node) {
        if (node.type === "YouTubePlayer") {
            this.registerNode(node, 0)
        }
    }

    defineElements(node) {

        let node_id = node.id

        this.elements[node_id] = {}
        this.elements[node_id].node = node
        this.elements[node_id].iframe = this.createYouTubeIframe(`ytp_${node_id}_frame`)
        this.elements[node_id].input = this.createInput(`ytp_${node_id}_input`)

        let input = node.addDOMWidget("textbox", `ytp_${node_id}_input`, this.elements[node_id].input, {
            serialize: false,
            hideOnZoom: false
        });

        let sp1 = node.addDOMWidget("iframe", `ytp_${node_id}_spacer`, document.createElement('div'), {
            serialize: false,
            hideOnZoom: false
        });

        node.addDOMWidget("iframe", `ytp_${node_id}_frame`, this.elements[node_id].iframe, {
            serialize: false,
            hideOnZoom: false
        });

        input.computeSize = function (width) {
            this.computeHeight = 30
            return [width, 30]
        }

        sp1.computeSize = function (width) {
            this.computeHeight = 5
            return [width, 5]
        }

        node.setSize([640, 480])

        this.elements[node_id].input.addEventListener('input', this.onInputChanged.bind(this, node_id))

    }

    onInputChanged(node_id, event) {
        let video_id = this.getYouTubeVideoId(event.target.value)
        if (video_id && this.elements[node_id]) {
            this.elements[node_id].node.setProperty("url", video_id)
            this.updateIframeSRC(this.elements[node_id].iframe, video_id)
        }
    }

    registerNode(node, mode) {
        if (mode == 1) {
            if (!this.nodes.includes(node)) {
                this.nodes.push(node)
                this.defineElements(node)
                if (node.properties['url'] && node.properties['url'].length > 0) {
                    this.updateIframeSRC(this.elements[node.id].iframe, node.properties['url'])
                    this.elements[node.id].input.value = `https://www.youtube.com/embed/${node.properties['url']}`
                }
            }
            else {
                if (this.elements[node.id] && node.properties['url'] && node.properties['url'].length > 0) {
                    this.first_time = true
                    this.updateIframeSRC(this.elements[node.id].iframe, node.properties['url'])
                    this.elements[node.id].input.value = `https://www.youtube.com/embed/${node.properties['url']}`
                }
            }
        }
        else if (mode == 0) {
            if (this.nodes.includes(node)) {
                this.nodes.splice(this.nodes.indexOf(node), 1)
                if (this.elements[node.id]) {
                    delete this.elements[node.id]
                }
            }
        }
    }

    registerNodes() {
        this.app.graph._nodes.forEach(node => {
            if (node.type === "YouTubePlayer") {
                this.registerNode(node, 1)
            }
        })
    }

    createInput(nodeid) {
        var input = document.createElement('input');
        input.type = "text"
        input.id = nodeid
        input.placeholder = "Enter youtube url: "
        input.style.border = "none"
        input.style.textIndent = "10px"
        input.style.borderRadius = "4px"
        input.style.backgroundColor = 'rgb(40,40,40)'
        return input;
    }

    updateIframeSRC(iframe, videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
    }

    createYouTubeIframe(nodeid) {
        var iframe = document.createElement('iframe');
        iframe.id = nodeid;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.style.borderRadius = "5px"
        iframe.style.backgroundColor = 'black'
        return iframe;
    }

    getYouTubeVideoId(url) {
        var videoId = null;
        var standardPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/.*[?&]v=([^&]+)/;
        var shortPattern = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/;
        var match = url.match(standardPattern);
        if (match && match[1]) {
            videoId = match[1];
        } else {
            match = url.match(shortPattern);
            if (match && match[1]) {
                videoId = match[1];
            }
        }
        return videoId;
    }

}

let youtube = new ComfyUIYouTubeVideoPlayer(app)

let youtubeExt = {
    name: "ComfyUIYoutube",
    async setup() {
        youtube.app.graph.onNodeAdded = youtube.onNodeAdded.bind(this);
        youtube.app.graph.onNodeRemoved = youtube.onNodeRemoved.bind(this);
    },
    async afterConfigureGraph() {
        console.log("YouTubePlayer Extension Loaded");
        youtube.registerNodes()
    }
};

app.registerExtension(youtubeExt);
