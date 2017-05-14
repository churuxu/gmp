
ifndef TARGET
##{ 
if(gmp.type == "shared"){
    out = "TARGET = " + gmp.target + ".so";
	gmp.ldcmd = "$(CXX) -o";
}else if(gmp.type == "static"){
    out = "TARGET = " + gmp.target + ".a";
	gmp.ldcmd = "$(AR) -rc";
}else{  
    out = "TARGET = " + gmp.target;
	gmp.ldcmd = "$(CXX) -o";
}
}##
endif

SRCS = ##{ 
for(i in gmp.srcs){
    var file = gmp.srcs[i];
    var extindex = file.lastIndexOf(".");
	if(extindex >= 0 && file.substr(extindex) == ".c"){
		out = out + " \\\n../" + file;
	}
} 
}##

SRCSCPP = ##{ 
for(i in gmp.srcs){
    var file = gmp.srcs[i];
    var extindex = file.lastIndexOf(".");
	if(!(extindex >= 0 && file.substr(extindex) == ".c")){
		out = out + " \\\n../" + file;
	}
} 
}##

CFLAGS += -Wall -O2 ##{
for(i in gmp.includes){    
	out = out + " -I../" + gmp.includes[i];	
}
}##  ##{
for(i in gmp.defines){    
	out = out + " -D" + gmp.defines[i];	
}
}## ##{
for(i in gmp.cflags){    
	out = out + " " + gmp.cflags[i];	
}
}## 
CPPFLAGS += $(CFLAGS) 
LDFLAGS += ##{
for(i in gmp.ldflags){    
	out = out + " " + gmp.ldflags[i];	
}
}## 

#========== do not modify below ==========
OBJDIR = objs/default
ifdef ARCH
	CFLAGS += -arch $(ARCH)	
	OBJDIR = objs/$(ARCH)
endif

OBJSTMP = $(foreach n, $(SRCS), $(subst /,-,$(n)).obj )
OBJS = $(foreach n, $(OBJSTMP), $(OBJDIR)/$(n) )

OBJSTMPCPP = $(foreach n, $(SRCSCPP), $(subst /,-,$(n)).objx )
OBJSCPP = $(foreach n, $(OBJSTMPCPP), $(OBJDIR)/$(n) )

$(TARGET): $(OBJDIR) $(OBJS) $(OBJSCPP)
	##{gmp.ldcmd}##  $(TARGET) $(LDFLAGS) $(OBJS) $(OBJSCPP)

%.obj: SRC = $(basename $(subst -,/, $(subst $(OBJDIR)/,,$@) ) )
%.obj: $(SRC)	
	$(CC) -c $(SRC) -o $@ $(CFLAGS) -MMD

%.objx: SRCCPP = $(basename $(subst -,/, $(subst $(OBJDIR)/,,$@) ) )
%.objx: $(SRCCPP)	
	$(CXX) -c $(SRCCPP) -o $@ $(CPPFLAGS) -MMD	
	

$(OBJDIR):
	mkdir -p $(OBJDIR)

clean:
	rm -f $(TARGET) 
	rm -fr $(OBJDIR) 
	
-include ${OBJS:.obj=.d}
-include ${OBJSCPP:.objx=.d}

