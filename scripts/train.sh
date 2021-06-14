
classifier_w=80
classifier_h=50

# CV_APP_PATH=bin/darwin

#cp ../../build_opencv/bin/opencv_traincascade bin/darwin/

cd negatives

mkdir -p output

../bin/darwin/opencv_traincascade -data ../output \
	-vec ../cropped.vec \
	-bg negatives.txt \
	-numPos 1000 -numNeg 600 -numStages 40 \
	-precalcValBufSize 4096 -precalcIdxBufSize 4096 \
	-featureType HAAR \
	-minHitRate 0.995 -maxFalseAlarmRate 0.5 \
	-w ${classifier_w} -h ${classifier_h}