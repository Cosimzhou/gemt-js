BUILD_DIR := build

main: GemtJs

prepare:
	@mkdir -p $(BUILD_DIR)

GLayerJs: prepare
	@echo "======================================="
	@echo "=  generate G layer js                ="
	@echo "======================================="
	@cat src/g*.js > $(BUILD_DIR)/GLayer.js

ELayerJs: prepare
	@echo "======================================="
	@echo "=  generate E layer js                ="
	@echo "======================================="
	@cat src/e*.js > $(BUILD_DIR)/ELayer.js

MLayerJs: prepare
	@echo "======================================="
	@echo "=  generate M layer js                ="
	@echo "======================================="
	@cat src/m*.js > $(BUILD_DIR)/MLayer.js

TLayerJs: prepare
	@echo "======================================="
	@echo "=  generate T layer js                ="
	@echo "======================================="
	@cat src/t*.js > $(BUILD_DIR)/TLayer.js

SvgPack:
	cd svg && ./svgpack.sh

GemtJs:  GLayerJs ELayerJs MLayerJs TLayerJs
	@echo "======================================="
	@echo "=  generate GEMT layer js             ="
	@echo "======================================="
	@echo "(function(){var exports = (typeof window !== 'undefined')? window: {}; " > $(BUILD_DIR)/gemt.js
	@cat src/utils.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/GLayer.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/ELayer.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/MLayer.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/TLayer.js >> $(BUILD_DIR)/gemt.js
	@echo "})();" >> $(BUILD_DIR)/gemt.js

GemtGccJs: GemtJs
	@cat $(BUILD_DIR)/gemt.js src/impl/gemt-implement.js | java -jar ~/.devtools/compiler-latest/closure-compiler-v20200614.jar --compilation_level ADVANCED > $(BUILD_DIR)/gemt-min.js


.PHONY:  GemtJs
