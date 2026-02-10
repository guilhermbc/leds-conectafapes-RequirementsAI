<script lang="ts" setup>
import NavGroup from './NavGroup.vue'
import NavItem from './NavItem.vue'
</script>

<template>
  <aside class="flex flex-col h-full px-4 py-6 text-white lg:px-2">
    <section class="flex flex-col grow items-center w-full h-14 px-5 space-x-2 bg-gray-0 z-30 lg:static lg:flex-col lg:justify-start lg:px-0 lg:space-x-0 lg:space-y-2 lg:bg-transparent">
      <!-- <NavItem to="/" label="Página inicial" /> -->

<NavGroup label="Projeto">
  <NavItem :to="{ name: 'projeto-home' }" label="Listar" />
  <NavItem :to="{ name: 'projeto-criar' }" label="Criar" />
</NavGroup><NavGroup label="Modulo">
  <NavItem :to="{ name: 'modulo-home' }" label="Listar" />
  <NavItem :to="{ name: 'modulo-criar' }" label="Criar" />
</NavGroup><NavGroup label="Documento">
  <NavItem :to="{ name: 'documento-home' }" label="Listar" />
  <NavItem :to="{ name: 'documento-criar' }" label="Criar" />
</NavGroup>

    </section>
  </aside>
</template>