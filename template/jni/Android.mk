LOCAL_PATH := $(call my-dir)

includes := ##{ 
for(i in gmp.includes){
    out += " \\\n$(LOCAL_PATH)/../" + gmp.includes[i];
} 
}##

sources := ##{ 
for(i in gmp.srcs){
    out += " \\\n../" + gmp.srcs[i];
} 
}##

gmpcflags := ##{ 
for(i in gmp.defines){
    out += " -D" + gmp.defines[i];
} 
}##
 
include $(CLEAR_VARS)
LOCAL_MODULE  := ##{gmp.target}##
LOCAL_C_INCLUDES :=  $(includes)
LOCAL_SRC_FILES := $(sources)
LOCAL_CFLAGS    += $(gmpcflags)
LOCAL_LDLIBS    := -llog  -lz -landroid

include $(BUILD_SHARED_LIBRARY)

