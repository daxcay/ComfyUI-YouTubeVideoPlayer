class YouTubeVideoPlayer:

    def __init__(self):
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {},
            "optional": {},
            "hidden": {}
        }

    FUNCTION = "doit"
    RETURN_TYPES = ()
    OUTPUT_NODE = True

    def doit(self):
        return ()

N_CLASS_MAPPINGS = {
    "YouTubeVideoPlayer": YouTubeVideoPlayer,
}

N_DISPLAY_NAME_MAPPINGS = {
    "YouTubeVideoPlayer": "YouTubeVideoPlayer",
}