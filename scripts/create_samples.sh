
#following example and some data from https://memememememememe.me/post/training-haar-cascades/

rm -f negatives/negatives.txt
ls -l1 negatives/*.jpg > negatives.txt

CV_APP_PATH=./bin/darwin

#apps built statically from opencv source: 
#cmake -DCMAKE_BUILD_TYPE=DEBUG -DBUILD_opencv_apps=ON -DBUILD_SHARED_LIBS=OFF ../opencv

rm -rf samples/samples.txt
mkdir -p samples

INFO_PATH=samples/samples_0.txt
IMG_PATH=positives/cropped_0.jpg

${CV_APP_PATH}/opencv_createsamples \
-img ${IMG_PATH} \
-bg negatives.txt \
-info ${INFO_PATH} \
-num 128 -maxxangle 0.0 -maxyangle 0.0 \
-maxzangle 0.3 -bgcolor 255 -bgthresh 8 \
-w 48 -h 30