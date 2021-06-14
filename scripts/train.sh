
classifier_w=48
classifier_h=30

# CV_APP_PATH=bin/darwin

#cp ../../build_opencv/bin/opencv_traincascade bin/darwin/

# https://docs.opencv.org/master/dc/d88/tutorial_traincascade.html

cd negatives

mkdir -p ../output

../bin/darwin/opencv_traincascade -data ../output \
	-vec ../data/cropped-${classifier_w}-${classifier_h}.vec \
	-bg negatives.txt \
	-numPos 1000 -numNeg 600 -numStages 24 \
	-precalcValBufSize 4096 -precalcIdxBufSize 4096 \
	-featureType HAAR -mode ALL \
	-minHitRate 0.995 -maxFalseAlarmRate 0.5 \
	-w ${classifier_w} -h ${classifier_h}