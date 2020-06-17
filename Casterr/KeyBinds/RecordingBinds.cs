﻿using System;
using System.Threading.Tasks;
using ElectronNET.API;
using Casterr.SettingsLib;
using Casterr.Services;

namespace Casterr.HelpersLib.KeyBinds
{
    public class RecordingBinds
    {
        public Task RegisterAll()
        {
            KeyBindingSettings ks = new KeyBindingSettings();

            Electron.GlobalShortcut.Register(ks.StartStopRecording, async () =>
            {
                Console.WriteLine("StartStopRecording pressed");
                await Notifications.Show("Cool Stuff Happened");
            });

            return Task.CompletedTask;
        }
    }
}
