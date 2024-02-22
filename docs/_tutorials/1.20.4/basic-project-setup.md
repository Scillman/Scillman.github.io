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
package com.github.scillman.minecraft.tutorial.recipe;

import java.util.Optional;

import org.spongepowered.include.com.google.gson.JsonParseException;
import org.spongepowered.include.com.google.gson.JsonSyntaxException;

import com.google.gson.JsonObject;

import net.minecraft.item.Item;
import net.minecraft.item.ItemStack;
import net.minecraft.item.Items;
import net.minecraft.network.PacketByteBuf;
import net.minecraft.recipe.Ingredient;
import net.minecraft.recipe.RecipeSerializer;
import net.minecraft.recipe.ShapedRecipe;
import net.minecraft.tag.TagKey;
import net.minecraft.util.Identifier;
import net.minecraft.util.JsonHelper;
import net.minecraft.util.registry.Registry;

public class CoffeeRecipeSerializer implements RecipeSerializer<CoffeeRecipe>
{
    /**
     * Constructs a {@link com.github.scillman.minecraft.tutorial.recipe.CoffeeRecipeSerializer CoffeeRecipeSerializer} from a Json object.
     * @param id The identifier to associate with the serializer.
     * @param json The Json object to read from.
     * @return An instance of the CoffeeRecipe object with the values set to the read data.
     * @throws JsonSyntaxException When incorrect Json data has been read.
     */
    @Override
    public CoffeeRecipe read(Identifier id, JsonObject json) throws JsonSyntaxException
    {
        Ingredient inCoffee         = CoffeeRecipeSerializer.fromJson(json, "coffee");
        Ingredient inCoffeeCup      = CoffeeRecipeSerializer.fromJson(json, "cup");
        Ingredient inCoffeeFilter   = CoffeeRecipeSerializer.fromJson(json, "filter");
        Ingredient inFuel           = CoffeeRecipeSerializer.fromJson(json, "fuel");
        Ingredient inWater          = CoffeeRecipeSerializer.fromJson(json, "water");

        Optional<Ingredient> additive1 = Optional.empty();
        if (json.has("additive1")) {
            additive1 = Optional.of(CoffeeRecipeSerializer.fromJson(json, "additive1"));
        }

        Optional<Ingredient> additive2 = Optional.empty();
        if (json.has("additive2")) {
            additive2 = Optional.of(CoffeeRecipeSerializer.fromJson(json, "additive2"));
        }

        ItemStack output = ShapedRecipe.outputFromJson(json);

        float experience = JsonHelper.getFloat(json, "experience", 0.0f);
        int brewTime = JsonHelper.getInt(json, "brewtime", 100);

        return new CoffeeRecipe(id, inCoffee, inCoffeeCup, inCoffeeFilter,
            inFuel, inWater, additive1, additive2, output, experience, brewTime);
    }

    /**
     * Creates an {@link net.minecraft.recipe.Ingredient Ingredient} from Json input.
     * @param json The Json object to read the contents from.
     * @param jsonKey The key of the ingredient inside the json.
     * @return An instance of the Ingredient class constructed with the read data.
     * @throws JsonSyntaxException When incorrect Json data has been read.
     */
    private static Ingredient fromJson(JsonObject json, String jsonKey) throws JsonSyntaxException
    {
        if (!json.has(jsonKey)) {
            throw new JsonParseException("Missing coffee recipe ingredient for: '" + jsonKey + "'");
        }

        String key = JsonHelper.getString(json, jsonKey);
        Identifier id = new Identifier(key);

        Item item = Registry.ITEM.getOrEmpty(id).orElseThrow(() -> new JsonSyntaxException("Unknown item '" + key + "' in coffee recipe"));
        if (item == Items.AIR) {
            throw new JsonSyntaxException("Invalid item: '" + key + "' in coffee recipe");
        }

        TagKey<Item> tagKey = TagKey.of(Registry.ITEM_KEY, id);
        return Ingredient.fromTag(tagKey);
    }

    /**
     * Creates a {@link com.github.scillman.minecraft.tutorial.recipe.CoffeeRecipe CoffeeRecipe} from binary data.
     * @param id The identifier.
     * @param buffer The buffer containing the binary data.
     * @return An instance of the CoffeeRecipe class with the values set to the read data.
     */
    @Override
    public CoffeeRecipe read(Identifier id, PacketByteBuf buffer)
    {
        int numAdditives;
        Ingredient inCoffee;
        Ingredient inCoffeeCup;
        Ingredient inCoffeeFilter;
        Ingredient inFuel;
        Ingredient inWater;
        Optional<Ingredient> inAdditive1 = Optional.empty();
        Optional<Ingredient> inAdditive2 = Optional.empty();
        ItemStack outCupOfCoffee;
        float experience;
        int brewTime;

        numAdditives = buffer.readVarInt();
        numAdditives = ((numAdditives < 0) ? 0 : ((numAdditives > 2) ? 2 : numAdditives));

        inCoffee = Ingredient.fromPacket(buffer);
        inCoffeeCup = Ingredient.fromPacket(buffer);
        inCoffeeFilter = Ingredient.fromPacket(buffer);
        inFuel = Ingredient.fromPacket(buffer);
        inWater = Ingredient.fromPacket(buffer);

        if (numAdditives >= 1) {
            inAdditive1 = Optional.of(Ingredient.fromPacket(buffer));
        }

        if (numAdditives >= 2) {
            inAdditive2 = Optional.of(Ingredient.fromPacket(buffer));
        }

        outCupOfCoffee = buffer.readItemStack();
        experience = buffer.readFloat();
        brewTime = buffer.readInt();

        return new CoffeeRecipe(id, inCoffee, inCoffeeCup, inCoffeeFilter, inFuel,
            inWater, inAdditive1, inAdditive2, outCupOfCoffee, experience, brewTime);
    }

    /**
     * Creates a {@link net.minecraft.network.PacketByteBuf PacketByteBuf} from the
     * {@link com.github.scillman.minecraft.tutorial.recipe.CoffeeRecipe CoffeeRecipe} instance.
     * @param buffer The buffer to write the CoffeeRecipe data into.
     * @param recipe The recipe to convert to binary data.
     */
    @Override
    public void write(PacketByteBuf buffer, CoffeeRecipe recipe)
    {
        int numAdditives = 0;
        if (recipe.inAdditive1.isPresent()) ++numAdditives;
        if (recipe.inAdditive2.isPresent()) ++numAdditives;

        buffer.writeVarInt(numAdditives);
        recipe.inCoffee.write(buffer);
        recipe.inCoffeeCup.write(buffer);
        recipe.inCoffeeFilter.write(buffer);
        recipe.inFuel.write(buffer);
        recipe.inWater.write(buffer);

        if (recipe.inAdditive1.isPresent()) {
            recipe.inAdditive1.get().write(buffer);
        }

        if (recipe.inAdditive2.isPresent()) {
            recipe.inAdditive2.get().write(buffer);
        }

        buffer.writeItemStack(recipe.outCupOfCoffee);
        buffer.writeFloat(recipe.experience);
        buffer.writeInt(recipe.brewTime);
    }
}
```

```json
{
    "parent": "block/block",
    "textures": {
        "particle": "block/sea_pickle",
        "all": "block/sea_pickle"
    },
    "elements": [
        {   "from": [ 2, 0, 2 ],
            "to": [ 6, 6, 6 ],
            "faces": {
                "down":  { "uv": [  8, 1,  12, 5 ], "texture": "#all", "cullface": "down" },
                "up":    { "uv": [  4, 1,  8, 5 ], "texture": "#all" },
                "north": { "uv": [ 4, 5, 8, 11 ], "texture": "#all" },
                "south": { "uv": [ 0, 5, 4, 11 ], "texture": "#all" },
                "west":  { "uv": [ 8, 5, 12, 11 ], "texture": "#all" },
                "east":  { "uv": [ 12, 5, 16, 11 ], "texture": "#all" }
            }
        },
        {
            "from": [ 2, 5.95, 2 ],
            "to": [ 6, 5.95, 6 ],
            "faces": {
                "up": {"uv": [  8, 1,  12, 5 ], "texture": "#all"}
            }
        },
        {
            "from": [ 9, 0, 10 ],
            "to": [ 13, 4, 14 ],
            "faces": {
                "down":  { "uv": [  8, 1,  12, 5 ], "texture": "#all", "cullface": "down" },
                "up":    { "uv": [  4, 1,  8, 5 ], "texture": "#all" },
                "north": { "uv": [ 4, 5, 8, 9 ], "texture": "#all" },
                "south": { "uv": [ 0, 5, 4, 9 ], "texture": "#all" },
                "west":  { "uv": [ 8, 5, 12, 9 ], "texture": "#all" },
                "east":  { "uv": [ 12, 5, 16, 9 ], "texture": "#all" }
            }
        },
        {
            "from": [ 9, 3.95, 10 ],
            "to": [ 13, 3.95, 14 ],
            "faces": {
                "up": {"uv": [  8, 1,  12, 5 ], "texture": "#all"}
            }
        },
        {
            "from": [ 9, 0, 2 ],
            "to": [ 13, 6, 6 ],
            "faces": {
                "down":  { "uv": [  8, 1,  12, 5 ], "texture": "#all", "cullface": "down" },
                "up":    { "uv": [  4, 1,  8, 5 ], "texture": "#all" },
                "north": { "uv": [ 4, 5, 8, 11 ], "texture": "#all" },
                "south": { "uv": [ 0, 5, 4, 11 ], "texture": "#all" },
                "west":  { "uv": [ 8, 5, 12, 11 ], "texture": "#all" },
                "east":  { "uv": [ 12, 5, 16, 11 ], "texture": "#all" }
            }
        },
        {
            "from": [ 9, 5.95, 2 ],
            "to": [ 13, 5.95, 6 ],
            "faces": {
                "up": {"uv": [  8, 1,  12, 5 ], "texture": "#all"}
            }
        },
        {
            "from": [ 2, 0, 8 ],
            "to": [ 6, 7, 12 ],
            "faces": {
                "down":  { "uv": [  8, 1,  12, 5 ], "texture": "#all", "cullface": "down" },
                "up":    { "uv": [  4, 1,  8, 5 ], "texture": "#all" },
                "north": { "uv": [ 4, 5, 8, 12 ], "texture": "#all" },
                "south": { "uv": [ 0, 5, 4, 12 ], "texture": "#all" },
                "west":  { "uv": [ 8, 5, 12, 12 ], "texture": "#all" },
                "east":  { "uv": [ 12, 5, 16, 12 ], "texture": "#all" }
            }
        },
        {
            "from": [ 2, 6.95, 8 ],
            "to": [ 6, 6.95, 12 ],
            "faces": {
                "up": {"uv": [  8, 1,  12, 5 ], "texture": "#all"}
            }
        },
        {
            "from": [ 3.5, 5.2, 4 ],
            "to": [ 4.5, 8.7, 4 ],
            "rotation": { "origin": [ 4, 8, 4 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "north": { "uv": [ 1, 0, 3, 5 ], "texture": "#all" },
                "south": { "uv": [ 3, 0, 1, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 4, 5.2, 3.5 ],
            "to": [ 4, 8.7, 4.5 ],
            "rotation": { "origin": [ 4, 8, 4 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "west": { "uv": [ 13, 0, 15, 5 ], "texture": "#all" },
                "east": { "uv": [ 15, 0, 13, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 10.5, 3.2, 12 ],
            "to": [ 11.5, 6.7, 12 ],
            "rotation": { "origin": [ 11, 8, 12 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "north": { "uv": [ 1, 0, 3, 5 ], "texture": "#all" },
                "south": { "uv": [ 3, 0, 1, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 11, 3.2, 11.5 ],
            "to": [ 11, 6.7, 12.5 ],
            "rotation": { "origin": [ 11, 8, 12 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "west": { "uv": [ 13, 0, 15, 5 ], "texture": "#all" },
                "east": { "uv": [ 15, 0, 13, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 10.5, 5.2, 4 ],
            "to": [ 11.5, 8.7, 4 ],
            "rotation": { "origin": [ 11, 8, 4 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "north": { "uv": [ 1, 0, 3, 5 ], "texture": "#all" },
                "south": { "uv": [ 3, 0, 1, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 11, 5.2, 3.5 ],
            "to": [ 11, 8.7, 4.5 ],
            "rotation": { "origin": [ 11, 8, 4 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "west": { "uv": [ 13, 0, 15, 5 ], "texture": "#all" },
                "east": { "uv": [ 15, 0, 13, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 3.5, 6.2, 10 ],
            "to": [ 4.5, 9.7, 10 ],
            "rotation": { "origin": [ 4, 8, 10 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "north": { "uv": [ 1, 0, 3, 5 ], "texture": "#all" },
                "south": { "uv": [ 3, 0, 1, 5 ], "texture": "#all" }
            }
        },
        {
            "from": [ 4, 6.2, 9.5 ],
            "to": [ 4, 9.7, 10.5 ],
            "rotation": { "origin": [ 4, 8, 10 ], "axis": "y", "angle": 45, "rescale": true },
            "shade": false,
            "faces": {
                "west": { "uv": [ 13, 0, 15, 5 ], "texture": "#all" },
                "east": { "uv": [ 15, 0, 13, 5 ], "texture": "#all" }
            }
        }
    ]
}
```

[image_ref_abc]:  data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAdElEQVQoz5VSwQ3AIAg8DQvoWP2zgp2pDtKxdIU+SBNipYH7iXfcEUitNURAAK7et3+1lKXCzBlBkO405pTnPIbBPzcONvt1sFDuis8QOcAGAJgCK9hfpEUjntkfRvTkGUBbuRan9S6BdqDo4gK3JMFS9LwfSg8g+7AvCPAAAAAASUVORK5CYII=