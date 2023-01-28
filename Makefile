BUILD_DIR := build

main: GemtJs

TSC_FLAGS := --downlevelIteration -t es6

prepare:
	@mkdir -p $(BUILD_DIR)

GLayerTs: prepare
	@echo "======================================="
	@echo "=  generate G layer js                ="
	@echo "======================================="
	@cat src/tss/g*.ts > $(BUILD_DIR)/GLayer.ts

ELayerTs: prepare
	@echo "======================================="
	@echo "=  generate E layer js                ="
	@echo "======================================="
	@cat src/tss/e*.ts > $(BUILD_DIR)/ELayer.ts

MLayerTs: prepare
	@echo "======================================="
	@echo "=  generate M layer js                ="
	@echo "======================================="
	@cat src/tss/m*.ts > $(BUILD_DIR)/MLayer.ts

TLayerTs: prepare
	@echo "======================================="
	@echo "=  generate T layer js                ="
	@echo "======================================="
	@cat src/tss/t*.ts > $(BUILD_DIR)/TLayer.ts

XLayerTs: prepare
	@echo "======================================="
	@echo "=  generate X plugin js               ="
	@echo "======================================="
	@cat src/tss/x*.ts > $(BUILD_DIR)/XLayer.ts

GemtTs: GLayerTs ELayerTs MLayerTs TLayerTs XLayerTs
	@echo "======================================="
	@echo "=  convert TS to JS                   ="
	@echo "======================================="
	@cat src/utils.js $(BUILD_DIR)/XLayer.ts $(BUILD_DIR)/GLayer.ts $(BUILD_DIR)/ELayer.ts $(BUILD_DIR)/MLayer.ts $(BUILD_DIR)/TLayer.ts > $(BUILD_DIR)/GEMT.ts
	@tsc $(TSC_FLAGS) $(BUILD_DIR)/GEMT.ts

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

XPluginJs:
	@echo "======================================="
	@echo "=  generate X Plugin js               ="
	@echo "======================================="
	@cat src/x*.js > $(BUILD_DIR)/XPlugin.js

SvgPack:
	cd svg && ./svgpack.sh

GemtJs:  GLayerJs ELayerJs MLayerJs TLayerJs
	# XPluginJs
	@echo "======================================="
	@echo "=  generate GEMT layer js             ="
	@echo "======================================="
	@echo "(function() {" > $(BUILD_DIR)/gemt.js
	@cat src/utils.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/GLayer.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/ELayer.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/MLayer.js >> $(BUILD_DIR)/gemt.js
	@cat $(BUILD_DIR)/TLayer.js >> $(BUILD_DIR)/gemt.js
	#@cat $(BUILD_DIR)/XPlugin.js >> $(BUILD_DIR)/gemt.js
	#@cat src/impl/gemt-implement.js >> $(BUILD_DIR)/gemt.js
	@echo "})();" >> $(BUILD_DIR)/gemt.js

GccJs: GemtJs
	@for f in `grep -Eo "prototype\.\\w*" $(BUILD_DIR)/gemt.js|grep -v "\._"|sort -u|awk -F. '{print $$2}'`; do sed -i "s/\.\b$$f\b/[\"$$f\"]/g" $(BUILD_DIR)/gemt.js; done
	@sed -i "s/^exports\.\(\\w*\)/exports[\"\1\"\]/" $(BUILD_DIR)/gemt.js
	#@cat $(BUILD_DIR)/gemt.js svg/pic-svg.js src/impl/gemt-implement.js | java -jar ~/local/compiler-latest/closure-compiler-v20200614.jar --compilation_level ADVANCED > $(BUILD_DIR)/gemt-min.js
	@cat $(BUILD_DIR)/gemt.js svg/pic-svg.js | java -jar ~/local/compiler-latest/closure-compiler-v20200614.jar --compilation_level ADVANCED > $(BUILD_DIR)/gemt-min.js


.PHONY:  GemtJs
