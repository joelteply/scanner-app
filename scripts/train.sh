opencv_traincascade -data output \
	-vec cropped.vec \
	-bg negatives/negatives.txt \
	-numPos 1000 -numNeg 600 -numStages 20 \
	-precalcValBufSize 1024 -precalcIdxBufSize 1024 \
	-featureType HAAR \
	-minHitRate 0.995 -maxFalseAlarmRate 0.5 \
	-w 128 -h 80