<?php 

namespace roilafx\constructor;

use EvolutionCMS\ServiceProvider;

class constructorServiceProvider extends ServiceProvider
{
    protected $namespace = 'constructor';

    public function register()
    {
        $this->loadPluginsFrom(
            dirname(__DIR__) . '/plugins/'
        );
        $this->loadSnippetsFrom(
            dirname(__DIR__) . '/snippets/'
        );
        $this->publishes([
            __DIR__ . '/../publishable/assets'  => MODX_BASE_PATH . 'assets',
        ]);
    }
    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../views', $this->namespace);
    }
}