---
author: Scillman
order: 1
mcversion: "1.20.4"
title: Basic Project Setup
link: basic-project-setup
date: 20240220
---
## Prerequisites
- This tutorial assumes you have a fully functional development environment, including Java, Gradle and Git.
- Have basic knowledge of Java.

## Introduction
In this tutorial we will go over setting up a basic project for modding in Fabric for Minecraft. This tutorial is optional, as an example mod can be downloaded [here](https://fabricmc.net/develop/template/), however it is adviced to follow the tutorial to get a better understanding of the basics.

During this tutorial we will set up a basic project that does absolutely nothing but compile. To achieve this we will need the create the following files:
* ``build.gradle``
* ``gradle.properties``
* ``settings.gradle``
* ``src/main/resources/mymod.mod.json``
* ``src/main/java/com/mymod/ModMain.java``

## settings.gradle
The ``settings.gradle`` file should reside in your project root directory. It contains the information necessary to run the ``build.gradle``. In the case of modding for Minecraft the most notable is the _Fabric_ repository. This is being added to allow the project to use the _Loom_ gradle plugin. The others being the standard repositories for plugins. Where ``gradlePluginPortal`` is the official Gradle repository, and ``mavenCentral`` the official Maven repository. You could add ``mavenLocal`` if you have your own compiled plugins that you wish to load. However this is not necessary for most modders.

```gradle
pluginManagement {
    repositories {
        maven {
            name = 'Fabric'
            url = 'https://maven.fabricmc.net/'
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
```

## gradle.properties
The ``gradle.properties`` contains the project specific settings. Every section of the file will be explained one after another from here on.

### org.gradle
```properties
org.gradle.jvmargs=-Xmx1G
org.gradle.parallel=true
```
These two lines are directives to your Gradle. As you may already suspect it tells Gradle it is allowed to use up to one gigabyte of memory and is allowed to run tasks in parallel if possible. Be aware though. Increasing the memory usage does NOT result in a faster build process in almost all cases. As such unless there is a very good reason, keep the value as is. If you change it arbitrarily you will increase the memory usage while it will not use it, unnecessarily increasing the load on the developer's hardware.

### Fabric Properties
```properties
minecraft_version=1.20.4
yarn_mappings=1.20.4+build.3
loader_version=0.15.7
```
These are pretty straightforward ``minecraft_version`` is set to the Minecraft version you wish to mod for, in this case we are modding for ``1.20.4``.


### Mod Properties
```properties
mod_version=1.0.0
maven_group=com.mymod
archives_base_name=mymod
```

### Dependencies
```properties
fabric_version=0.96.1+1.20.4
fabric_versiononly=0.96.1
```

![][image_ref_abc]

## TODO

``net.fabricmc.api.ModInitializer`` ``onInitialize``

``net.fabricmc.api.ClientModInitializer`` ``onInitializeClient``

``net.fabricmc.api.DedicatedServerModInitializer`` ``onInitializeServer``

```java
package com.github.scillman.minecraft.tutorial;

import net.fabricmc.api.ModInitializer;
import net.minecraft.client.MinecraftClient;

public class ModMain implements ModInitializer {

    @Override
    public void onInitialize() {
        // Your code comes here...
        MinecraftClient client = MinecraftClient.getInstance();
        @Nullable PlayerEntity player = client.player;
    }
}
```

[image_ref_abc]:  data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAdElEQVQoz5VSwQ3AIAg8DQvoWP2zgp2pDtKxdIU+SBNipYH7iXfcEUitNURAAK7et3+1lKXCzBlBkO405pTnPIbBPzcONvt1sFDuis8QOcAGAJgCK9hfpEUjntkfRvTkGUBbuRan9S6BdqDo4gK3JMFS9LwfSg8g+7AvCPAAAAAASUVORK5CYII=