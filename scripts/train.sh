
classifier_w=48
classifier_h=30

# CV_APP_PATH=bin/darwin

#cp ../../build_opencv/bin/opencv_traincascade bin/darwin/

cd negatives

../bin/darwin/opencv_traincascade -data output \
	-vec ../cropped.vec \
	-bg negatives.txt \
	-numPos 1000 -numNeg 600 -numStages 20 \
	-precalcValBufSize 1024 -precalcIdxBufSize 1024 \
	-featureType HAAR \
	-minHitRate 0.995 -maxFalseAlarmRate 0.5 \
	-w ${classifier_w} -h ${classifier_h}