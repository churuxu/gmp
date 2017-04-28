
ifndef TARGET
	TARGET = ##{gmp.target}##.a
endif

SRCS = ##{ 
for(i in gmp.srcs){
    out = out + " \\\n../" + gmp.srcs[i];
} 
}##


CFLAGS += -Wall -O2 
CPPFLAGS = $(CFLAGS) 


#========== do not modify below ==========
TARGETDIR = target/default
ifdef ARCH
	CFLAGS += -arch $(ARCH)	
	TARGETDIR = target/$(ARCH)
endif
OBJDIR = $(TARGETDIR)/obj

OBJSTMP = $(foreach n, $(SRCS), $(subst /,++,$(n)).obj )
OBJS = $(foreach n, $(OBJSTMP), $(OBJDIR)/$(n) )

$(TARGETDIR)/$(TARGET): $(OBJDIR) $(OBJS)
	$(AR) -rc $(TARGETDIR)/$(TARGET) $(OBJS)

%.obj: SRC = $(basename $(subst ++,/, $(subst $(OBJDIR)/,,$@) ) )
%.obj: $(SRC)	
	$(CXX) -c $(SRC) -o $@ $(CPPFLAGS) -MMD

%.d: %.obj

$(OBJDIR):
	mkdir -p $(OBJDIR)

clean:
	rm -f $(OBJS) $(TARGET) ${OBJS:.obj=.d}

-include ${OBJS:.obj=.d}

