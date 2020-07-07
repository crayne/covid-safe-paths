#import <React/RCTLog.h>
#import <React/RCTBridgeModule.h>
#import "BT-Swift.h"

@interface ENExposureModule: NSObject <RCTBridgeModule>
@end

@implementation ENExposureModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getLastDetectionDate: (RCTResponseSenderBlock)callback) {
  [[ExposureManager shared] getLastDetectionDateWithCallback:callback];
}

@end