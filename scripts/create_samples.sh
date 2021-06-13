


opencv_createsamples -img cropped00.jpg \
-bg negatives/negatives.txt \
-info samples/cropped00.txt \
-num 128 -maxxangle 0.0 -maxyangle 0.0 \
-maxzangle 0.3 -bgcolor 255 -bgthresh 8 \
-w 48 -h 48