# Race System Refactoring Guide

## Current State Analysis

The codebase is in a transitional state between legacy global functions and a modern ES6 module architecture. The race week functionality is broken due to several architectural inconsistencies:

### Key Issues Identified:

1. **Fragmented Race Logic**: Race setup and execution logic is scattered across 10+ root-level files
2. **Legacy/Modern Hybrid**: Mix of global functions and ES6 classes causing dependency confusion  
3. **Import/Export Mismatches**: Missing or incorrect imports breaking the module system
4. **Data Flow Disconnection**: ProgressionManager generates data but UI update functions can't access it properly
5. **Circular Dependencies**: Some modules importing each other creating initialization timing issues

### Current Race-Related Files:

